"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, History, Plus } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar"
import { AssistantMessage } from "@/components/assistant-message"

interface Message {
  role: "user" | "assistant"
  content: string
  data?: {
    message: string
    extractedData: Record<string, any>
    canGenerateDocument: boolean
    missingInfo: string[]
    documentContent?: string
  }
}

export function ChatSidebar({ open, orgId, ...props }: React.ComponentProps<typeof Sidebar> & { open?: boolean; orgId?: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Array<{id: string; titre: string; updatedAt: string}>>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (orgId) loadConversations()
  }, [orgId])

  const loadConversations = async () => {
    try {
      const res = await fetch(`/api/chat/history?orgId=${orgId}`)
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Load conversations error:', error)
    }
  }

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/history/${id}`)
      const data = await res.json()
      setMessages(data.messages || [])
      setConversationId(id)
      setShowHistory(false)
    } catch (error) {
      console.error('Load conversation error:', error)
    }
  }

  const saveConversation = async () => {
    if (!orgId || messages.length === 0) return

    try {
      const res = await fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          conversationId,
          messages,
          titre: messages[0]?.content.slice(0, 50) || 'Nouvelle conversation'
        })
      })
      const data = await res.json()
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId)
        await loadConversations()
      }
    } catch (error) {
      console.error('Save conversation error:', error)
    }
  }

  const handleSaveDocument = async (data: NonNullable<Message['data']>) => {
    try {
      const response = await fetch("/api/documents/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ANNONCE",
          contenu: data.documentContent,
          extractedData: data.extractedData
        })
      })

      if (response.ok) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "✅ Document enregistré avec succès ! Vous pouvez le retrouver dans vos documents juridiques." 
        }])
      }
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      })

      const data = await response.json()
      
      if (data.error) {
        const errorMessages = [...updatedMessages, { role: "assistant" as const, content: "Erreur: " + data.error }]
        setMessages(errorMessages)
        await saveConversationWithMessages(errorMessages)
        return
      }
      
      let cleanMessage = data.message.trim()
      if (cleanMessage.startsWith('```json')) {
        cleanMessage = cleanMessage.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      }
      
      const parsed = JSON.parse(cleanMessage)
      const finalMessages = [...updatedMessages, { 
        role: "assistant" as const, 
        content: parsed.message,
        data: parsed 
      }]
      setMessages(finalMessages)
      await saveConversationWithMessages(finalMessages)
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessages = [...updatedMessages, { role: "assistant" as const, content: "Erreur de connexion" }]
      setMessages(errorMessages)
      await saveConversationWithMessages(errorMessages)
    } finally {
      setLoading(false)
    }
  }

  const saveConversationWithMessages = async (msgs: Message[]) => {
    if (!orgId || msgs.length === 0) return

    try {
      const res = await fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          conversationId,
          messages: msgs,
          titre: msgs[0]?.content.slice(0, 50) || 'Nouvelle conversation'
        })
      })
      const data = await res.json()
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId)
        await loadConversations()
      }
    } catch (error) {
      console.error('Save conversation error:', error)
    }
  }

  return (
    <Sidebar 
      side="right" 
      variant="inset" 
      collapsible="offcanvas"
      className={open ? "" : ""}
      {...props}
    >
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold group-data-[collapsible=icon]:hidden">Assistant Juridique</h2>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => { setMessages([]); setConversationId(null) }}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {showHistory ? (
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 py-4">
              {conversations.map(conv => (
                <Button
                  key={conv.id}
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => loadConversation(conv.id)}
                >
                  <div className="truncate">
                    <div className="font-medium truncate">{conv.titre}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4 group-data-[collapsible=icon]:hidden">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" ? (
                  <div className="space-y-2 max-w-[85%]">
                    <AssistantMessage text={msg.content} />
                    {msg.data?.canGenerateDocument && msg.data.documentContent && (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleSaveDocument(msg.data!)}
                      >
                        💾 Enregistrer le document
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg px-3 py-2 max-w-[85%] text-sm bg-primary text-primary-foreground">
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t px-0 py-4 group-data-[collapsible=icon]:hidden">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Posez votre question..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
