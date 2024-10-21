import React from 'react';
import { MdSpaceDashboard, MdLeaderboard } from "react-icons/md";
import { BiStats } from "react-icons/bi";
import { FaLightbulb } from "react-icons/fa";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: MdSpaceDashboard,
  },
  {
    title: "Statistics",
    url: "#",
    icon: BiStats,
  },
  {
    title: "Leaderboard",
    url: "#",
    icon: MdLeaderboard,
  },
  {
    title: "Recommendations",
    url: "#",
    icon: FaLightbulb,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="w-64 h-screen bg-stone-950 text-white">
        <SidebarHeader className="px-4 py-5">  
          <SidebarMenu>
            <SidebarMenuItem>
            
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">Documentation</span>
                      <span className="">its logo time</span>
                    </div>
                    
                  </SidebarMenuButton>
                
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-sm font-semibold py-5 text-gray-400">EcoFarm</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center space-x-3 px-4 py-5 hover:bg-stone-700">
                      <item.icon className="w-6 h-6" /> {/* Increased icon size */}
                      <span className='text-lg'>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}