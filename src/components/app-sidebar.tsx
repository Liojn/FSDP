import React from 'react'
import { MdOutlineSpaceDashboard, MdOutlineLeaderboard } from "react-icons/md"
import { IoStatsChartOutline } from "react-icons/io5"
import { FaRegLightbulb } from "react-icons/fa"
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
import { SignOut } from "@/components/ui/signout";

const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: MdOutlineSpaceDashboard,
  },
  {
    title: "Statistics",
    url: "#",
    icon: IoStatsChartOutline,
  },
  {
    title: "Leaderboard",
    url: "#",
    icon: MdOutlineLeaderboard,
  },
  {
    title: "Recommendations",
    url: "#",
    icon: FaRegLightbulb,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-6 py-5">  
        <div className="flex items-center">
          <Avatar className="mr-3">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-xl">EcoFarm</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-sm font-semibold py-5 text-gray-400">
            EcoFarm
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a 
                      href={item.url} 
                      className="flex items-center space-x-2 px-4 py-3 hover:bg-stone-800 hover:text-white transition-colors text-base"
                    >
                      <item.icon className="" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-4">
        <SignOut /> {/* Signout function */}
      </div>
    </Sidebar>
  )
}