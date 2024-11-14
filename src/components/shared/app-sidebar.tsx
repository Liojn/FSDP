"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "../ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";

import {
  BadgeCheck,
  Bell,
  ChartColumn,
  ChevronsUpDown,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Medal,
  PencilLine,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Dashboard", url: "/dashboards", icon: LayoutDashboard },
  { title: "Prediction", url: "/prediction", icon: ChartColumn },
  { title: "Badges", url: "/badges", icon: Medal },
  { title: "Campaign", url: "/campaign", icon: PencilLine },
];

const appConfig = {
  name: "AgriTech",
  logo: "/LogoA.jpg",
};

// Memoize the entire component to prevent unnecessary re-renders
const AppSidebar = React.memo(function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [userData, setUserData] = useState({
    name: "Placeholder Name",
    email: "guest@example.com",
  });

  // Use useEffect to safely access localStorage on the client side
  useEffect(() => {
    setUserData({
      name: localStorage.getItem("userName") || "Placeholder Name",
      email: localStorage.getItem("userEmail") || "guest@example.com",
    });
  }, []);

  const handleLogout = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    router.push("/login");
  }, [router]);

  const handleNavigate = useCallback(
    (url: string) => {
      router.push(url);
    },
    [router]
  );

  const renderUserProfile = useMemo(
    () => (
      <div className="flex w-full items-center gap-3">
        <div className="flex flex-1 flex-col text-left">
          <span className="truncate text-sm font-semibold text-white">
            {userData.name}
          </span>
          <span className="truncate text-xs text-stone-400">
            {userData.email}
          </span>
        </div>
        <ChevronsUpDown className="size-4 text-stone-400" />
      </div>
    ),
    [userData]
  );

  const renderDropdownContent = useMemo(
    () => (
      <>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">{userData.name}</span>
            <span className="text-xs text-stone-400">{userData.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="border-stone-800" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 py-2 text-stone-400 hover:text-white"
            onClick={() => router.push("/account")}
          >
            <BadgeCheck className="size-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 py-2 text-stone-400 hover:text-white"
            onClick={() => console.log("Opening notifications...")}
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
      </>
    ),
    [userData, handleLogout]
  );

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
                className="size-5 object-cover w-full h-full rounded-lg"
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
          <SidebarGroupLabel className="px-4 py-3 font-semibold text-stone-400">
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
                  {renderUserProfile}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-60 rounded-lg border border-stone-800 bg-stone-900 text-white"
                side="top"
                align="end"
                sideOffset={4}
              >
                {renderDropdownContent}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
});

export default AppSidebar;
