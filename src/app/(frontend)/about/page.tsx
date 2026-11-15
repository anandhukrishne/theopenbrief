import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-gray-100 py-4 px-4 sm:px-6 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="The Open Brief"
              className="h-7 sm:h-9 w-auto object-contain"
            />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-gray-600">
            <Link href="/journal" className="hover:text-black">Journal</Link>
            <Link href="/stories" className="hover:text-black">Stories</Link>
            <Link href="/explainers" className="hover:text-black">Explainers</Link>
            <Link href="/tech" className="hover:text-black">Tech Bites</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">About The Open Brief</h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-8">
          The Open Brief is an independent publication dedicated to thoughtful essays, short stories, technical explainers, and architectural notes.
        </p>

        <div className="prose prose-gray max-w-none text-gray-700 space-y-6 leading-relaxed">
          <p>
            We believe the modern internet has an abundance of immediacy, but a deficit of clarity. 
            The Open Brief is designed as an antidote: a quiet reading space prioritizing craft, editorial depth, and durable thinking over ephemeral engagement.
          </p>
          <p>
            Our writers and contributors work across fiction, engineering, philosophy, and design. 
            Every dispatch is edited and presented with deliberate care.
          </p>
        </div>
      </div>
    </main>
  )
}
