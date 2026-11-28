export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#FCFCFD] dark:bg-[#080C14] transition-colors">
      <div className="relative flex items-center justify-center">
        {/* Outer subtle glow/track */}
        <div className="w-16 h-16 rounded-full border-2 border-neutral-200 dark:border-neutral-800" />

        {/* Spinning indicator ring */}
        <div className="absolute w-16 h-16 rounded-full border-2 border-transparent border-t-red-600 dark:border-t-red-500 animate-spin" />

        {/* Center Official TOB Logo */}
        <img
          src="/tob-mark.png"
          alt="TOB"
          className="absolute w-8 h-auto object-contain dark:hidden select-none"
        />
        <img
          src="/tob-mark-white.png"
          alt="TOB"
          className="absolute w-8 h-auto object-contain hidden dark:block select-none"
        />
      </div>

      <p className="mt-4 text-xs font-sans font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 select-none animate-pulse">
        Loading...
      </p>
    </div>
  )
}
