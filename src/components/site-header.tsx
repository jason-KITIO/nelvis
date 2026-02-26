"use client"

import { useState } from "react"
import { usePathname, useParams } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, ChevronRight, MessageSquare } from "lucide-react"
import { mvpNavigation } from "@/config/navigation"
import Link from "next/link"
import { useSidebar } from "@/components/ui/sidebar"

export function SiteHeader({ onToggleChat }: { onToggleChat: () => void }) {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const params = useParams()
  const orgId = params.orgId as string

  const getBreadcrumbs = () => {
    const allItems = [...mvpNavigation.main, ...mvpNavigation.settings]
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: { label: string; href?: string }[] = []

    // Trouver l'item principal de la sidebar
    const mainItem = allItems.find(item => {
      const itemPath = item.url.replace('[orgId]', orgId)
      return pathname === itemPath || pathname.startsWith(itemPath + '/')
    })

    if (mainItem) {
      breadcrumbs.push({ label: mainItem.title, href: mainItem.url.replace('[orgId]', orgId) })

      // Ajouter les sous-segments
      const mainPath = mainItem.url.replace('[orgId]', orgId)
      const remainingPath = pathname.replace(mainPath, '').split('/').filter(Boolean)

      remainingPath.forEach((segment, index) => {
        if (segment === 'nouveau') {
          breadcrumbs.push({ label: `Créer ${mainItem.title.toLowerCase()}` })
        } else if (segment === 'scanner') {
          breadcrumbs.push({ label: 'Scanner un reçu' })
        } else if (index === 0 && segment.length > 10) {
          // C'est probablement un ID
          breadcrumbs.push({ label: `Détails` })
        } else {
          breadcrumbs.push({ label: segment.charAt(0).toUpperCase() + segment.slice(1) })
        }
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1">
              {crumb.href ? (
                <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleChat}>
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  )
}
