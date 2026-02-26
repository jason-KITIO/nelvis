"use client"

import * as React from "react"
import { Building2 } from "lucide-react"
import { useParams } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useOrganisation } from "@/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { mvpNavigation } from "@/config/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams();
  const orgId = params.orgId as string;
  const { data: orgData, isLoading } = useOrganisation(orgId);
  const organisation = orgData?.organisation;

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                {isLoading ? (
                  <>
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="grid flex-1 gap-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </>
                ) : organisation?.logoUrl ? (
                  <>
                    <img
                      src={organisation.logoUrl}
                      alt={organisation.name}
                      className="size-8 rounded-lg object-cover"
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{organisation.name}</span>
                      <span className="truncate text-xs">{organisation.formeJuridique}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                      <Building2 className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{organisation?.name || "Organisation"}</span>
                      <span className="truncate text-xs">{organisation?.formeJuridique || ""}</span>
                    </div>
                  </>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mvpNavigation.main} />
        {/* <SidebarSeparator className="my-4" /> */}
        <NavMain items={mvpNavigation.settings} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
