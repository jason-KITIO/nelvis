"use client"

import { useEffect, useState } from "react"

export function useTypewriter(text: string, speed = 25) {
  const [displayed, setDisplayed] = useState("")

  useEffect(() => {
    setDisplayed("")
    let index = 0
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(index))
      index++
      if (index >= text.length) clearInterval(interval)
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return displayed
}
