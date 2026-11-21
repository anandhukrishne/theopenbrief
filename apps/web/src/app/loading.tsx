export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#FCFCFD] dark:bg-[#080C14] transition-colors">
      <div className="relative flex items-center justify-center">
        {/* Outer subtle glow/track */}
        <div className="w-14 h-14 rounded-full border-2 border-neutral-200 dark:border-neutral-800" />
        
        {/* Spinning indicator ring */}
        <div className="absolute w-14 h-14 rounded-full border-2 border-transparent border-t-red-600 dark:border-t-red-500 animate-spin" />
        
        {/* Center TOB Monogram */}
        <span className="absolute font-bold text-[11px] tracking-wider text-neutral-900 dark:text-neutral-100 font-mono select-none">
          TOB
        </span>
      </div>

      <p className="mt-4 text-xs font-mono tracking-widest uppercase text-neutral-400 dark:text-neutral-500 select-none animate-pulse">
        Loading...
      </p>
    </div>
  )
}
