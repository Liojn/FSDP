"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

import { cn } from "@/lib/utils"; // Import the 'cn' utility function

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Statistics",
    url: "/statistics",
    icon: ChartColumn,
  },
  {
    title: "Leaderboard",
    url: "/leaderboard",
    icon: Medal,
  },
  {
    title: "Recommendations",
    url: "/recommendations",
    icon: Lightbulb,
  },
];

const appConfig = {
  name: "EcoFarm",
  logo: "/path/to/your/logo.png", // TODO: Update the logo URL to a valid path
};

interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

export function AppSidebar() {
  const pathname = usePathname();
  const [imageError, setImageError] = React.useState(false);

  const userProfile: UserProfile = {
    name: "Placeholder Name", // TODO: Replace with real user profile data
    email: "placeholder.email@example.com", // TODO: Replace with real user profile data
    avatarUrl: "https://via.placeholder.com/150", // TODO: Update the avatar URL or handle it dynamically
  };

  const handleLogout = async () => {
    try {
      // TODO: Add actual logout logic
      console.log("Logging out...");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavigate = (url: string) => {
    // TODO: Add additional navigation logic if needed
    console.log(`Navigating to ${url}`);
  };

  const handleNotifications = () => {
    // TODO: Implement notification handling logic
    console.log("Opening notifications...");
  };

  const handleAccountSettings = () => {
    // TODO: Implement account settings logic
    console.log("Opening account settings...");
  };

  return (
    <Sidebar className="border-r border-stone-800 bg-stone-900">
      <SidebarHeader className="px-6 py-5">
        <div className="flex items-center space-x-3">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            {!imageError ? (
              <Image
                src={appConfig.logo}
                alt={`${appConfig.name} Logo`}
                width={20}
                height={20}
                className="size-5"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-lg font-bold">
                {appConfig.name.charAt(0)}
              </span>
            )}
          </div>
          <span className="text-lg font-semibold text-white">
            {appConfig.name}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3 text font-semibold text-stone-400">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        "group relative flex items-center space-x-3 px-4 py-3 transition-colors",
                        pathname === item.url
                          ? "bg-stone-800 text-white"
                          : "text-stone-400 hover:bg-stone-800 hover:text-white"
                      )}
                      onClick={() => handleNavigate(item.url)}
                    >
                      <span>
                        <item.icon size={19} />
                      </span>
                      <span className="flex-1">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

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
                    <div className="relative flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-800 text-sm font-medium text-white">
                        {userProfile.name[0]}
                      </div>
                    </div>
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
                className="w-60 rounded-lg border border-stone-800 bg-stone-900 text-white"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">
                      {userProfile.name}
                    </span>
                    <span className="text-xs text-stone-400">
                      {userProfile.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="border-stone-800" />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 py-2 text-stone-400 hover:text-white"
                    onClick={handleAccountSettings}
                  >
                    <BadgeCheck className="size-4" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 py-2 text-stone-400 hover:text-white"
                    onClick={handleNotifications}
                  >
                    <Bell className="size-4" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="border-stone-800" />
                <DropdownMenuItem
                  className="flex cursor-pointer items-center gap-2 py-2 text-red-400 hover:text-red-300"
                  onClick={handleLogout}
                >
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

/*
TODO: Update the app logo path to a valid logo URL.
TODO: Replace placeholder user profile data with dynamic user data fetched from a server or authentication provider.
TODO: Implement the actual logout logic in `handleLogout`.
TODO: Add real navigation logic (e.g., router push) in `handleNavigate`.
TODO: Implement real notification handling in `handleNotifications`.
TODO: Implement account settings handling logic in `handleAccountSettings`.
TODO: Handle avatar image loading errors more gracefully, possibly with a default image fallback.
TODO: Improve responsiveness for smaller screen sizes, especially for the sidebar.
*/
