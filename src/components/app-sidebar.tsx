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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const items = [
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
}

export function AppSidebar() {
  const pathname = usePathname();
  const [imageError, setImageError] = React.useState(false);

  const userProfile: UserProfile = {
    name: "Placeholder Name", // TODO: Replace with real user profile data
    email: "placeholder.email@example.com", // TODO: Replace with real user profile data
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
      <div className="p-4">
        <Button
          className="w-full bg-white text-black hover:bg-gray-200"
          size="lg"
        >
          Sign Out
        </Button>
      </div>
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
