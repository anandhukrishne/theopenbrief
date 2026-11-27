# Codebase Architecture and File Reference

This document provides a comprehensive breakdown of the entire Open Brief platform, explaining the end-to-end architecture, data flows, operational mechanisms, and an exhaustive file-by-file directory reference detailing the role and responsibility of every single file in the repository.

---

## 1. System Architecture

TheOpenBrief codebase is architected as an npm workspace monorepo consisting of two decoupled Next.js 15 applications supported by a managed Supabase PostgreSQL backend:

1. **Reader Web Platform (`apps/web`)**: The public-facing editorial publication hosted at `theopenbrief.app`. It consumes published article data over HTTP from the Admin API, renders editorial layouts with a zero-dependency server-side Markdown parser, supports dark and light display modes, and serves RSS syndication feeds.
2. **Editorial Studio (`apps/admin`)**: The staff administration portal hosted at `admin.theopenbrief.app`. It connects directly to Supabase Auth and Supabase PostgreSQL via connection pooling, providing staff authentication, role-based article authoring, user profile management, team roster administration, and an automated WebP image processing pipeline.

```
+-----------------------------------------------------------------------------------+
|                                 Supabase Backend                                  |
|                                                                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  |            Supabase Auth            |  |        PostgreSQL Database         |  |
|  |  - auth.users (encrypted passwords) |  |  - public.profiles                 |  |
|  |  - Email OTP generation/verify      |  |  - public.articles                 |  |
|  +-------------------------------------+  |  - public.auth_rate_limits         |  |
|                                           +------------------------------------+  |
+------------------------------------------^----------------------------------------+
                                           |
                                  SQL / pg connection pooler
                                  Supabase Admin Service Role API
                                           |
+------------------------------------------v----------------------------------------+
|                      Editorial Studio (`apps/admin`)                              |
|                      Domain: admin.theopenbrief.app                               |
|                                                                                   |
|  - Middleware Route Protection (/dashboard, /login)                               |
|  - 2-Step Login: Password Verification -> Supabase Email OTP                      |
|  - 5-Day Secure HTTP-Only openbrief_session Cookie                                |
|  - Full Editorial Studio (Article CRUD, Markdown Editor, Section Selection)       |
|  - Staff Management (Role hierarchy: owner > editor > writer)                     |
|  - WebP Canvas Client Compressor + GitHub CDN Raw Upload Pipeline                 |
|  - Public JSON API (/api/articles, /api/articles?slug=...)                        |
+------------------------------------------^----------------------------------------+
                                           |
                                 HTTPS JSON Data Fetch
                                 (cache: no-store / ISR)
                                           |
+------------------------------------------v----------------------------------------+
|                     Reader Web Platform (`apps/web`)                             |
|                     Domain: theopenbrief.app                                      |
|                                                                                   |
|  - Front Page Broadsheet Layout (Lead story, Section Trio, Dynamic Streams)       |
|  - Editorial Section Views (Journal, Explainers, Tech, CineBrief, General)        |
|  - Custom Zero-Dependency Server Markdown Parser (AST-free linear tokenizer)      |
|  - Author Profile and Dedicated Catalog Views                                     |
|  - RSS 2.0 XML Dynamic Feed Generator (/rss.xml)                                  |
|  - Dynamic Theme System (Editorial Dark / High-Contrast Light)                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. How the Application Works

### 2.1 Authentication and Verification Lifecycle

The editorial portal utilizes a hardened two-step authentication scheme combining credentials with temporary one-time passwords generated and validated directly through Supabase Auth:

1. **Step 1: Password Verification and OTP Dispatch (`POST /api/auth/otp`)**:
   - The user submits their email address and password on the login screen (`apps/admin/src/app/login/page.tsx`).
   - The server validates the credentials against Supabase Auth via `supabase.auth.signInWithPassword`.
   - If the password fails, an immediate 401 response is returned with no OTP triggered.
   - If valid, the temporary password session is immediately cleared via `supabase.auth.signOut` to prevent bypassing the second factor.
   - The server checks `public.auth_rate_limits` to prevent brute-force attacks.
   - The server calls `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })`. Supabase generates an 8-digit (or 6-digit) secure numeric token and dispatches it to the user's email address. Unauthorized users cannot trigger OTP emails because `shouldCreateUser: false` forbids spontaneous registrations.

2. **Step 2: OTP Verification and Session Establishment (`POST /api/auth/verify`)**:
   - The user enters the received OTP token using the 8-cell auto-advancing input interface.
   - The server executes `supabase.auth.verifyOtp({ email, token, type: 'email' })`.
   - Upon successful verification, the user's staff record is fetched or automatically seeded in `public.profiles`.
   - The server signs and encrypts a 5-day session payload containing user ID, email, role, and display name, storing it in an HTTP-only, secure, `SameSite=Lax` cookie named `openbrief_session`.
   - The user is redirected to `/dashboard`.

3. **Route Protection (`apps/admin/src/middleware.ts`)**:
   - Every request to `/dashboard` or `/dashboard/*` is inspected by Next.js edge middleware.
   - Requests lacking a valid `openbrief_session` cookie are redirected to `/login`.
   - Authenticated sessions attempting to access `/login` are automatically redirected to `/dashboard`.

### 2.2 Editorial Content Lifecycle

1. **Article Composition**:
   - Staff members write articles in the `/dashboard` interface using standard Markdown syntax.
   - Fields include Title, Slug, Section (`journal`, `explainers`, `tech`, `cinebrief`, `general`), Status (`draft` or `published`), Excerpt, Cover Image URL, Image Caption, and Read Time.
2. **Persistence and Role Controls (`apps/admin/src/app/api/articles/route.ts`)**:
   - When a writer saves or edits an article, the endpoint verifies their permissions.
   - Writers are restricted to updating and deleting only their own articles.
   - Editors and owners have authority to edit, reassign, publish, or delete any article across the publication.
   - Articles are saved in PostgreSQL table `public.articles`.
3. **Public Exposure**:
   - The API route `/api/articles` responds to public `GET` requests with published articles only, omitting drafts unless requested with an active staff session.
   - Articles support URL query parameters: `section`, `slug`, `author_id`, `limit`, and `offset`.

### 2.3 Special Editions System & Thematic Design

The platform features an editorial system for managing and designing commemorative issues (such as the Christmas Edition or Republic Day Special):

1. **Edition Creation and Administration (`apps/admin/src/app/dashboard/page.tsx` & `/api/editions`)**:
   - Editors and administrators design special editions with custom properties: Title, URL Slug, Theme Preset (`christmas`, `republic`, `heritage`, `monsoon`, `midnight`, `classic`), Accent Color, Commemorative Badge text, Subtitle, Overview, Cover Art, and an introductory "Letter from the Editor".
   - Curators multi-select existing published articles into the edition and establish custom reading sequences.
   - Writers drafting dispatches can also directly assign stories to an active Special Edition from the Writing Desk.
2. **Dedicated Bespoke Reader Experience (`apps/web/src/app/editions/[slug]/page.tsx`)**:
   - When a reader visits `/editions/[slug]`, the page dynamically renders a themed aesthetic reflecting the issue:
     - **Christmas**: Festive crimson and pine palette, seasonal heraldic ribbons, snowflake motifs, warm frosted card styling.
     - **Republic Day**: Sovereign navy, saffron and tricolor heraldry, commemorative emblem watermarks, stately broadsheet serif typography.
     - **Heritage, Monsoon, Midnight, Classic**: Tailored palettes for historical essays, literary issues, future tech specials, or traditional broadsheets.
   - Includes a Lead Flagship Story showcase, companion inquiry columns, and the Editor's Prologue.
3. **Editions Archive (`apps/web/src/app/editions/page.tsx`)**:
   - A dedicated public index showcasing all past and present special editions with issue covers, themes, story counts, and navigation links.

### 2.4 Image and CDN Pipeline

1. **Client-Side Compression (`apps/admin/src/lib/imageCompressor.ts` & `WebPUploader.tsx`)**:
   - Authors upload cover images or body graphics via file picker or drag-and-drop.
   - The client browser loads the image into an offscreen HTML5 `<canvas>`, calculates optimal aspect ratios, resizes oversized graphics, and compresses the image to modern WebP format at 85% quality.
2. **GitHub CDN Delivery (`apps/admin/src/app/api/cdn/upload/route.ts`)**:
   - The compressed WebP blob is transmitted to the admin upload endpoint.
   - If configured with `GITHUB_CDN_TOKEN` and `GITHUB_CDN_REPO`, the endpoint commits the file directly to a dedicated GitHub repository via the GitHub REST API.
   - The endpoint returns a direct raw URL (e.g., `https://raw.githubusercontent.com/...`) for permanent, high-performance static delivery.

### 2.4 Reader Experience and Rendering Engine

1. **Decoupled Data Ingestion (`apps/web/src/lib/api.ts`)**:
   - The reader web app never connects directly to PostgreSQL. Instead, it queries the public Admin REST API (`https://admin.theopenbrief.app/api/articles`).
   - Requests are cached and revalidated using Next.js Incremental Static Regeneration (ISR) and server-side component rendering.
2. **Custom Zero-Dependency Markdown Parser (`apps/web/src/app/articles/[slug]/page.tsx`)**:
   - Rather than loading heavy external Markdown dependencies (such as heavy remark/rehype trees), the reader platform contains a lightweight zero-dependency parser tailored for editorial journalism.
   - The parser supports blockquotes, primary and secondary headings, unordered lists, paragraphs, external links, bold emphasis, inline code snippets, and inline images with captions.
3. **Design System and Theming**:
   - The interface features high-contrast typography influenced by classic broadsheets, utilizing Georgia, Garamond, and modern sans-serif typefaces.
   - A theme switch (`ThemeToggle.tsx`) manages instant toggling between dark charcoal editorial mode and crisp daylight paper mode.

---

## 3. Directory and File Reference

### 3.1 Monorepo Root Directory

- **`package.json`**: Root monorepo configuration declaring npm workspaces (`apps/*`) and shared development scripts (`build:web`, `build:admin`, `lint`, `clean`).
- **`package-lock.json`**: Locked dependency graph ensuring deterministic installations across local environments and deployment servers.
- **`tsconfig.json`**: Root TypeScript configuration providing base compiler settings inherited by workspaces.
- **`tailwind.config.js`**: Shared Tailwind CSS foundation containing global design tokens, typography settings, and color palette definitions.
- **`postcss.config.js`**: PostCSS processing pipeline activating Tailwind CSS and Autoprefixer for root asset compilation.
- **`next.config.ts`**: Root Next.js configuration stub ensuring workspace compatibility.
- **`.gitignore`**: Git exclusion rules preventing local environment files (`.env*.local`), `node_modules`, build outputs (`.next`, `dist`), and OS artifacts from entering version control.
- **`.env.local.example`**: Exhaustive environment variable template detailing all required Supabase connection parameters, public site URLs, and optional CDN tokens.
- **`supabase_schema.sql`**: Production database schema definitions. Contains DDL statements for `public.profiles`, `public.articles`, and `public.auth_rate_limits`, along with performance indexes and Row Level Security policies.
- **`CNAME`**: Custom domain identifier configured for root GitHub Pages or DNS forwarding where applicable.
- **`README.md`**: Monorepo orientation guide with quickstart instructions and service dependencies.
- **`CODEBASE_OVERVIEW.md`**: This document; the definitive architectural manual and exhaustive file dictionary for the entire repository.

#### Root CI/CD Workflows (`.github/workflows/`)

- **`.github/workflows/static.yml`**: GitHub Actions automated deployment workflow for compiling and hosting static repository assets to GitHub Pages.
- **`.github/workflows/jekyll-gh-pages.yml`**: Legacy GitHub Pages publishing workflow for Jekyll documentation sites.

---

### 3.2 Editorial Studio (`apps/admin`)

The administration application handles staff authentication, article management, user profiles, team rosters, and media uploads.

#### Build and Configuration Files

- **`apps/admin/package.json`**: Admin package definition declaring dependencies including `@supabase/supabase-js`, `pg`, `@types/pg`, Next.js 15, React 19, and Tailwind CSS.
- **`apps/admin/next.config.ts`**: Next.js configuration for the admin portal. Configures image domains, remote patterns, build headers, and production TypeScript settings.
- **`apps/admin/tsconfig.json`**: TypeScript compiler configuration specific to `apps/admin`, setting path aliases (`@/*` mapping to `./src/*`).
- **`apps/admin/tailwind.config.js`**: Tailwind CSS configuration customized for the dashboard interface, sidebar navigation, form controls, and dark editorial palette.
- **`apps/admin/postcss.config.js`**: PostCSS configuration applying Tailwind CSS processing to admin stylesheets.

#### Core Application and Middleware

- **`apps/admin/src/middleware.ts`**: Next.js Edge Middleware intercepting incoming requests. Inspects `openbrief_session` cookies, guards `/dashboard` routes against unauthenticated users, and redirects logged-in users away from `/login`.
- **`apps/admin/src/app/layout.tsx`**: Root HTML layout wrapper for `apps/admin`. Injects web fonts, viewport metadata, and body styles.
- **`apps/admin/src/app/globals.css`**: Global stylesheet for the admin portal containing CSS variables, base Tailwind imports, scrollbar styling, and custom utilities.
- **`apps/admin/src/app/login/page.tsx`**: Staff login user interface. Implements the two-step authentication sequence: initial email and password entry followed by an 8-box OTP verification screen with automatic focus switching and clipboard paste handling.
- **`apps/admin/src/app/dashboard/page.tsx`**: Comprehensive single-page editorial workspace. Houses the article listing, article creation/edit forms, live markdown preview, section categorization, profile editor, and staff member roster administration.

#### Server API Routes (`apps/admin/src/app/api/`)

- **`apps/admin/src/app/api/auth/otp/route.ts`**: Step 1 authentication endpoint. Validates user email and password against Supabase Auth (`signInWithPassword`), confirms staff validity, checks rate limits, and triggers an OTP email dispatch via Supabase `signInWithOtp({ shouldCreateUser: false })`.
- **`apps/admin/src/app/api/auth/verify/route.ts`**: Step 2 authentication endpoint. Verifies the user-submitted 8-digit or 6-digit OTP token against Supabase Auth (`verifyOtp`), fetches the staff profile, issues the encrypted `openbrief_session` HTTP-only cookie, and clears rate-limit counters.
- **`apps/admin/src/app/api/auth/login/route.ts`**: Direct password authentication route used for administrative fallback or legacy client compatibility.
- **`apps/admin/src/app/api/auth/session/route.ts`**: Session introspection and termination endpoint. Validates the active session cookie for client components or destroys the session cookie upon logout.
- **`apps/admin/src/app/api/articles/route.ts`**: Core article REST API. Supports public `GET` requests for published articles (with filtering by slug, section, or author) and authenticated `POST`, `PUT`, and `DELETE` operations with strict role checks (writers edit their own articles; editors and owners manage all).
- **`apps/admin/src/app/api/staff/route.ts`**: Staff administration endpoint. Handles team member onboarding, role promotion/demotion, and user deletion by coordinating Supabase Auth Admin (`createUser`, `updateUserById`, `deleteUser`) with the `public.profiles` database table.
- **`apps/admin/src/app/api/editions/route.ts`**: Special Editions REST API. Supports public and authenticated `GET` requests (retrieving all editions or resolving a specific edition by slug with all its curated articles in order), as well as `POST`, `PUT`, and `DELETE` operations for editors and administrators.
- **`apps/admin/src/app/api/profile/route.ts`**: User profile endpoint allowing authenticated writers and editors to retrieve and update their own name, biography, beat, and avatar URL.
- **`apps/admin/src/app/api/cdn/upload/route.ts`**: Image hosting proxy endpoint. Receives compressed WebP image data and uploads it directly to the designated GitHub CDN repository, returning a raw URL for immediate use in articles.

#### Library Modules (`apps/admin/src/lib/`)

- **`apps/admin/src/lib/db.ts`**: PostgreSQL database connector utilizing `pg.Pool` with Supabase transaction connection pooler (`DATABASE_URL_POOLED` or `DATABASE_URL`). Manages table initialization queries (`initDb`) and profile creation routines (`getOrCreateProfile`).
- **`apps/admin/src/lib/auth.ts`**: Authentication helper utilities for server routes. Decodes and verifies `openbrief_session` cookie payloads, validates authorization headers, and extracts active user IDs and roles.
- **`apps/admin/src/lib/supabaseServer.ts`**: Server-side Supabase client initialized with the privileged `SUPABASE_SERVICE_ROLE_KEY`. Executes administrative identity and user management tasks.
- **`apps/admin/src/lib/supabaseClient.ts`**: Browser-safe Supabase client initialized with public environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **`apps/admin/src/lib/rateLimit.ts`**: Security module tracking failed login attempts in `public.auth_rate_limits`. Enforces automatic lockout periods when threshold limits are exceeded to thwart credential brute-forcing.
- **`apps/admin/src/lib/imageCompressor.ts`**: Client-side image optimization utility that downscales images via HTML5 Canvas and converts input files into lightweight WebP format prior to network transmission.

#### UI Components (`apps/admin/src/components/`)

- **`apps/admin/src/components/WebPUploader.tsx`**: Interactive image uploader component with drag-and-drop support, upload progress indications, automatic WebP compression, and direct insertion of the resulting CDN URL into article forms.

#### Static Public Assets (`apps/admin/public/`)

- **`apps/admin/public/favicon.ico`**: Browser favicon icon file for the admin application.
- **`apps/admin/public/favicon.png`**: High-resolution PNG favicon icon.
- **`apps/admin/public/logo.png`**: Primary dark Open Brief logomark.
- **`apps/admin/public/logo-white.png`**: Inverted white Open Brief logomark for dark mode display.
- **`apps/admin/public/logo-openbrief-plus.png`**: Sub-brand insignia for Open Brief Plus.
- **`apps/admin/public/logo-openbrief-plus-white.png`**: Inverted white insignia for Open Brief Plus.
- **`apps/admin/public/logo-technobrief.png`**: Sub-brand insignia for TechnoBrief section.
- **`apps/admin/public/logo-technobrief-white.png`**: Inverted white insignia for TechnoBrief section.
- **`apps/admin/public/logo-cinebrief.png`**: Sub-brand insignia for CineBrief entertainment section.
- **`apps/admin/public/logo-cinebrief-white.png`**: Inverted white insignia for CineBrief entertainment section.
- **`apps/admin/public/logo-tob-explainers.png`**: Sub-brand insignia for TOB Explainers section.
- **`apps/admin/public/logo-tob-explainers-white.png`**: Inverted white insignia for TOB Explainers section.
- **`apps/admin/public/footer-art.png`**: Decorative footer illustration asset.
- **`apps/admin/public/hello-again.png`**: Welcoming illustration displayed on the authentication screen.
- **`apps/admin/public/carousel/slide-1.jpg`**: Authentication promotional carousel graphic 1.
- **`apps/admin/public/carousel/slide-2.png`**: Authentication promotional carousel graphic 2.
- **`apps/admin/public/carousel/slide-3.png`**: Authentication promotional carousel graphic 3.
- **`apps/admin/public/carousel/slide-4.png`**: Authentication promotional carousel graphic 4.
- **`apps/admin/public/carousel/slide-5.png`**: Authentication promotional carousel graphic 5.

---

### 3.3 Reader Web Platform (`apps/web`)

The reader application provides the high-performance public reading experience, broadsheet homepage, section pages, author indexes, and RSS syndication.

#### Build and Configuration Files

- **`apps/web/package.json`**: Reader platform package definition declaring Next.js 15, React 19, Lucide React icons, and styling dependencies.
- **`apps/web/next.config.ts`**: Next.js configuration for the reader site. Specifies remote image domains (GitHub raw content, Unsplash, Supabase storage) and security response headers.
- **`apps/web/tsconfig.json`**: TypeScript compiler configuration establishing path alias mapping (`@/*` to `./src/*`).
- **`apps/web/tailwind.config.js`**: Tailwind CSS theme containing publication-specific typography classes, serif font families, and high-contrast editorial color stops.
- **`apps/web/postcss.config.js`**: PostCSS processing pipeline for reader styles.
- **`apps/web/.env.example`**: Environment template indicating reader site configuration keys (`NEXT_PUBLIC_CMS_URL`, `NEXT_PUBLIC_SITE_URL`).

#### Core Application Structure (`apps/web/src/app/`)

- **`apps/web/src/app/layout.tsx`**: Master layout wrapping all reader routes. Houses persistent global components: `SiteHeader`, navigation bars, footer directory, and the theme provider script.
- **`apps/web/src/app/globals.css`**: Global publication stylesheet with CSS reset rules, broadsheet typography styling, dark-theme variables, and watermark positioning rules.
- **`apps/web/src/app/loading.tsx`**: Instant loading fallback screen displaying a subtle broadsheet skeleton animation while server components fetch data.
- **`apps/web/src/app/page.tsx`**: TheOpenBrief front page. Renders a comprehensive broadsheet edition featuring a lead story banner, a three-column section spotlight row, dynamic section streams, and trending story sidebars.
- **`apps/web/src/app/articles/[slug]/page.tsx`**: Article detail reading page. Fetches story data by slug, computes read times, renders author metadata and beats, and processes article content through a custom zero-dependency server Markdown parser.
- **`apps/web/src/app/editions/page.tsx`**: Special Editions index and archive. Displays commemorative issues with theme badges, issue dates, and links to each edition's dedicated page.
- **`apps/web/src/app/editions/[slug]/page.tsx`**: Specially designed commemorative edition page. Implements dynamic thematic design systems (Christmas, Republic Day, Heritage, Monsoon, Midnight Tech, Classic) with custom heraldic borders, cover banners, editor's prologues, and curated lead and companion story collections.
- **`apps/web/src/app/authors/[author]/page.tsx`**: Author profile and catalog view. Displays author biography, beat, avatar, and an index of all published articles authored by that contributor.
- **`apps/web/src/app/journal/page.tsx`**: Dedicated section landing page for Longform Journalism and deep analytical essays.
- **`apps/web/src/app/explainers/page.tsx`**: Dedicated section landing page for structured explainers and contextual backgrounders.
- **`apps/web/src/app/tech/page.tsx`**: Dedicated section landing page for TechnoBrief coverage, software engineering, and hardware reporting.
- **`apps/web/src/app/cinebrief/page.tsx`**: Dedicated section landing page for cinema criticism, film essays, and visual media culture.
- **`apps/web/src/app/general/page.tsx`**: Dedicated section landing page for cultural dispatches, opinions, and general interest briefs.
- **`apps/web/src/app/about/page.tsx`**: Editorial mission statement, masthead information, editorial standards, and publication background.
- **`apps/web/src/app/privacy/page.tsx`**: Privacy policy outlining data collection, cookie usage, and reader analytics disclosures.
- **`apps/web/src/app/terms/page.tsx`**: Terms of service covering content copyright, syndication rules, and intellectual property.
- **`apps/web/src/app/sitemap/page.tsx`**: Comprehensive HTML directory providing organized links to all sections, key stories, and publication information.
- **`apps/web/src/app/rss/page.tsx`**: Human-readable syndication portal explaining feed availability and instructions for subscribing in RSS readers.
- **`apps/web/src/app/rss.xml/route.ts`**: Dynamic RSS 2.0 XML route handler. Queries published stories from the API and dynamically compiles a compliant XML feed with full CDATA content blocks.

#### Reader Components (`apps/web/src/components/`)

- **`apps/web/src/components/SiteHeader.tsx`**: Global header displaying publication masthead, current date, edition badge, section quick-links, and theme toggle button.
- **`apps/web/src/components/HomeNav.tsx`**: Sticky secondary navigation bar allowing frictionless transitions across all editorial desks.
- **`apps/web/src/components/CoverImage.tsx`**: Resilient image component that handles cover photographs with smooth fade-in loading, aspect ratio preservation, and graceful fallback states.
- **`apps/web/src/components/ThemeToggle.tsx`**: Client button controlling the transition between Dark editorial reading mode and daylight Paper mode, persisted via `localStorage`.
- **`apps/web/src/components/SectionPageView.tsx`**: Reusable view template shared across all section routes, rendering a section hero, featured layout, and article grid.
- **`apps/web/src/components/SectionHeroBlock.tsx`**: Prominent section banner showcasing section titles, sub-brand logos, and editorial desk descriptions.
- **`apps/web/src/components/SectionTrioRow.tsx`**: Three-column broadsheet layout component displaying side-by-side featured stories across different sections.
- **`apps/web/src/components/SectionWatermark.tsx`**: Aesthetic background watermark component rendering thematic SVG and PNG artwork behind section headers.

#### Library Modules (`apps/web/src/lib/`)

- **`apps/web/src/lib/api.ts`**: Client and server HTTP fetch layer for the reader app. Interfaces with `https://admin.theopenbrief.app/api/articles` with error resilience, null checks, and revalidation logic.
- **`apps/web/src/lib/utils.ts`**: Editorial helper routines for formatting human-friendly publication dates, slugifying titles, and estimating reading times.

#### Static Public Assets (`apps/web/public/`)

- **`apps/web/public/favicon.ico`**: Favicon icon for browser tabs.
- **`apps/web/public/favicon.png`**: High-resolution favicon asset.
- **`apps/web/public/logo.png`**: Dark publication logo for light backgrounds.
- **`apps/web/public/logo-white.png`**: White publication logo for dark backgrounds.
- **`apps/web/public/logo-openbrief-plus.png`**: Sub-brand insignia for Open Brief Plus.
- **`apps/web/public/logo-openbrief-plus-white.png`**: White insignia for Open Brief Plus.
- **`apps/web/public/logo-technobrief.png`**: Sub-brand insignia for TechnoBrief.
- **`apps/web/public/logo-technobrief-white.png`**: White insignia for TechnoBrief.
- **`apps/web/public/logo-cinebrief.png`**: Sub-brand insignia for CineBrief.
- **`apps/web/public/logo-cinebrief-white.png`**: White insignia for CineBrief.
- **`apps/web/public/logo-tob-explainers.png`**: Sub-brand insignia for TOB Explainers.
- **`apps/web/public/logo-tob-explainers-white.png`**: White insignia for TOB Explainers.
- **`apps/web/public/footer-art.png`**: Broadsheet engraving artwork rendered in the website footer.
- **`apps/web/public/watermark-articles.svg`**: Thematic SVG watermark representing general reporting.
- **`apps/web/public/watermark-circuit.svg`**: Thematic SVG watermark representing technology reporting.
- **`apps/web/public/watermark-projector.svg`**: Thematic SVG watermark representing cinema reporting.
- **`apps/web/public/watermark-plus.svg`**: Thematic SVG watermark representing premium essays.
- **`apps/web/public/watermark-star.png`**: Star insignia graphic for decorative dividers.

---

## 4. Environment Variables Reference

| Variable | Location | Scope | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Root / `apps/admin` | Server | Direct Supabase PostgreSQL connection string (port 5432) |
| `DATABASE_URL_POOLED` | Root / `apps/admin` | Server | Transaction-pooled Supabase connection string (port 6543) via PgBouncer |
| `NEXT_PUBLIC_SUPABASE_URL` | Root / `apps/admin` | Client & Server | Supabase project API URL (e.g., `https://[ref].supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Root / `apps/admin` | Client & Server | Supabase anonymous public client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Root / `apps/admin` | Server only | Supabase privileged service role key for Auth Admin operations |
| `NEXT_PUBLIC_SITE_URL` | Root / `apps/web` | Client & Server | Fully qualified URL of the public reader site (`https://theopenbrief.app`) |
| `NEXT_PUBLIC_CMS_URL` | Root / `apps/web` | Client & Server | Fully qualified URL of the admin API backend (`https://admin.theopenbrief.app`) |
| `GITHUB_CDN_TOKEN` | Root / `apps/admin` | Server only | Optional GitHub Personal Access Token for committing WebP images to CDN repo |
| `GITHUB_CDN_REPO` | Root / `apps/admin` | Server only | Optional target repository for image storage (e.g., `owner/cdn-repo`) |
| `GITHUB_CDN_BRANCH` | Root / `apps/admin` | Server only | Branch name for image storage (defaults to `main`) |

---

## 5. Development and Build Commands

Execute these commands from the monorepo root:

- **Install dependencies across all workspaces**:
  ```bash
  npm install
  ```
- **Run the Reader Platform locally (port 3000)**:
  ```bash
  npm run dev:web
  ```
- **Run the Editorial Studio locally (port 3001)**:
  ```bash
  npm run dev:admin
  ```
- **Build the Reader Platform for production**:
  ```bash
  npm run build:web
  ```
- **Build the Editorial Studio for production**:
  ```bash
  npm run build:admin
  ```
- **Lint the codebase across all workspaces**:
  ```bash
  npm run lint
  ```
