import React from "react";
import Image from "next/image";
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
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BadgeCheck,
  Bell,
  ChartColumn,
  ChevronsUpDown,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Medal,
} from "lucide-react";

// TODO: Replace with actual navigation items from your routing configuration
// TODO: Add active state handling for navigation items
// TODO: Add proper type definitions for navigation items
const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard", // TODO: Replace with actual route
    icon: LayoutDashboard,
  },
  {
    title: "Statistics",
    url: "/statistics", // TODO: Replace with actual route
    icon: ChartColumn,
  },
  {
    title: "Leaderboard",
    url: "/leaderboard", // TODO: Replace with actual route
    icon: Medal,
  },
  {
    title: "Recommendations",
    url: "/recommendations", // TODO: Replace with actual route
    icon: Lightbulb,
  },
];

// TODO: Move to environment variables or configuration file
const appConfig = {
  name: "EcoFarm",
  logo: "/path/to/your/logo.png", // TODO: Add actual logo file and update path
};

// TODO: Move interface to separate types file
interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

export function AppSidebar() {
  // TODO: Integrate with authentication system
  // TODO: Add loading state while fetching user data
  // TODO: Add error handling for failed user data fetch
  const userProfile: UserProfile = {
    name: "Placeholder Name",
    email: "placeholder.email@example.com",
    avatarUrl: "https://via.placeholder.com/150", // TODO: Replace with actual user avatar or default avatar
  };

  // TODO: Add click handlers for dropdown menu items
  // TODO: Add proper navigation handling (e.g., using Next.js Link component)
  return (
    <Sidebar className="border-r border-stone-800 bg-stone-900">
      <SidebarHeader className="px-6 py-5">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          {/* TODO: Add error handling for logo image load failure */}
          <Image
            src={appConfig.logo}
            alt={`${appConfig.name} Logo`}
            width={40}
            height={40}
            className="size-4"
          />
        </div>
        <div className="grid flex-1 text-left">
          <span className="truncate font-semibold text-white">
            {appConfig.name}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-5 text-sm font-semibold text-stone-400">
            {appConfig.name}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {/* TODO: Replace anchor tags with Next.js Link components */}
                    {/* TODO: Make icons bigger */}
                    <a
                      href={item.url}
                      className="flex space-x-3 px-4 py-3 text-stone-300 transition-colors hover:bg-stone-800 hover:text-white"
                    >
                      <item.icon />
                      <span className="text-base">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* TODO: Add proper event handlers for user menu actions */}
      <SidebarFooter className="border-t border-stone-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full px-3 py-3 hover:bg-stone-800"
                >
                  <div className="flex w-full items-center gap-3">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage
                        src={userProfile.avatarUrl}
                        alt={userProfile.name}
                      />
                      <AvatarFallback className="rounded-lg bg-emerald-600 text-white">
                        {userProfile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col text-left">
                      <span className="truncate text-sm font-semibold text-white">
                        {userProfile.name}
                      </span>
                      <span className="truncate text-xs text-stone-400">
                        {userProfile.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="size-4 text-stone-400" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-lg border border-stone-800 bg-stone-900 text-white"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage
                        src={userProfile.avatarUrl}
                        alt={userProfile.name}
                      />
                      <AvatarFallback className="rounded-lg bg-emerald-600 text-white">
                        {userProfile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="truncate font-semibold">
                        {userProfile.name}
                      </span>
                      <span className="truncate text-xs text-stone-400">
                        {userProfile.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="border-stone-800" />

                <DropdownMenuGroup>
                  {/* TODO: Add proper routing for account and notifications pages */}
                  <DropdownMenuItem className="flex items-center gap-2 py-2 text-stone-300 hover:bg-stone-800 hover:text-white">
                    <BadgeCheck className="size-4" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 py-2 text-stone-300 hover:bg-stone-800 hover:text-white">
                    <Bell className="size-4" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="border-stone-800" />

                {/* TODO: Implement logout functionality */}
                <DropdownMenuItem className="flex items-center gap-2 text-red-400 hover:bg-stone-800 hover:text-red-300">
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
