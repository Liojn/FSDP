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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    <Sidebar className="h-screen bg-stone-950 text-white">
        <SidebarHeader className="px-4 py-5">  
          <SidebarMenu>
            <SidebarMenuItem>
                {/* user logo and name here */}
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    
                    <Avatar className='mr-3'>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>

                    
                    <div className="flex flex-col  leading-none">
                      <span className="font-semibold text-xl">EcoFarm</span>
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
                    <a href={item.url} className="flex items-center space-x-3 px-4 py-6 hover:bg-stone-700">
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