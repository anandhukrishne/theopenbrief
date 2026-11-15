// This file wires Payload CMS into Next.js App Router as the admin panel.
// The admin UI is served at: /admin and /admin/*
// Auth cookies are set here — HttpOnly, Secure, never in the URL.

import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'
import configPromise from '@payload-config'
import type { Metadata } from 'next'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config: configPromise, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config: configPromise, params, searchParams, importMap })

export default Page
