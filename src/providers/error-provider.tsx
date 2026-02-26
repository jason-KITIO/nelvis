"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { ErrorDialog } from "@/components/error-dialog"

interface ErrorContextType {
  showError: (message: string, title?: string) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [title, setTitle] = useState<string>()

  const showError = (message: string, title?: string) => {
    setMessage(message)
    setTitle(title)
    setOpen(true)
  }

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <ErrorDialog
        open={open}
        onOpenChange={setOpen}
        message={message}
        title={title}
      />
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error("useError doit être utilisé dans un ErrorProvider")
  }
  return context
}
