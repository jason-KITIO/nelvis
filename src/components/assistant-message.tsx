"use client"

import { useTypewriter } from "@/hooks/use-typewriter"
import { cn } from "@/lib/utils"

interface AssistantMessageProps {
  text: string
  className?: string
}

export function AssistantMessage({ text, className }: AssistantMessageProps) {
  const displayed = useTypewriter(text, 25)

  return (
    <div
      className={cn(
        "inline-block rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed",
        "whitespace-pre-line relative",
        className
      )}
    >
      {displayed}
      {displayed.length < text.length && (
        <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-foreground align-baseline" />
      )}
    </div>
  )
}
