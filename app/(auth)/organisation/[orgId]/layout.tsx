"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar";
import { ChatSidebar } from "@/components/chat-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader onToggleChat={() => setChatOpen(!chatOpen)} />
        {children}
      </SidebarInset>
      {chatOpen && <ChatSidebar />}
    </SidebarProvider>
  );  
}
