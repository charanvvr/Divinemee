import { cn } from "@/lib/utils"

export function Logo({
  className,
  textClassName,
}: {
  className?: string
  textClassName?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 48 48"
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
      >
        <path
          d="M24 6c9.94 0 18 8.06 18 18 0 6.5-3.45 12.2-8.62 15.36 2.1-3.1 3.3-6.92 3.3-11.36 0-9.94-8.06-18-18-18-1.6 0-3.16.21-4.64.6C17.2 7.6 20.46 6 24 6Z"
          fill="var(--gold)"
        />
        <path
          d="M30 9c.9 2 1.4 4.2 1.4 6.6 0 8.9-7.2 16.1-16.1 16.1-2 0-3.9-.36-5.66-1.02"
          fill="none"
          stroke="var(--champagne)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      <span className={cn("flex flex-col leading-none", textClassName)}>
        <span className="font-display text-lg tracking-tight">divine mee</span>
        <span className="text-[9px] uppercase tracking-[0.32em] text-muted">
          self care ritual
        </span>
      </span>
    </span>
  )
}
