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
  ChartColumn,
  ChevronsUpDown,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Medal,
  PencilLine,
  Coins,
  Store,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Dashboard", url: "/dashboards", icon: LayoutDashboard },
  { title: "Prediction", url: "/prediction", icon: ChartColumn },
  { title: "Badges", url: "/badges", icon: Medal },
  { title: "Campaign", url: "/campaign", icon: PencilLine },
  { title: "Store", url: "/store", icon: Store },
];

const recommendationItems = [
  { title: "Recommendation", url: "/recommendation", icon: Lightbulb },
];

const appConfig = {
  name: "AgriTech",
  logo: "/LogoA.jpg",
};

const AppSidebar = React.memo(function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [userData, setUserData] = useState({
    name: "Placeholder Name",
    email: "guest@example.com",
    storeCurrency: 0,
  });

useEffect(() => {
  const handleStoreCurrencyUpdate = (event: CustomEvent) => {
    console.log("Store Currency Update Event Received:", event.detail);
    
    const newStoreCurrency = Number(event.detail?.newStoreCurrency);
    
    console.log("Parsed New Store Currency:", newStoreCurrency);
    
    if (!isNaN(newStoreCurrency)) {
      setUserData(prev => ({
        ...prev,
        storeCurrency: newStoreCurrency
      }));
      
      // Optional: Update localStorage for persistence
      localStorage.setItem("storeCurrency", newStoreCurrency.toString());
    } else {
      console.error("Invalid store currency value received");
    }
  };

  window.addEventListener('updateStoreCurrency', handleStoreCurrencyUpdate as EventListener);

  return () => {
    window.removeEventListener('updateStoreCurrency', handleStoreCurrencyUpdate as EventListener);
  };
}, []);

useEffect(() => {
  const fetchUserData = async () => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      try {
        const response = await fetch(`/api/company/${storedEmail}`);
        if (response.ok) {
          const userData = await response.json();
          const storeCurrency = Number(userData.carbonCredits) || 0; // Ensure it's a number
          setUserData({
            name: userData.name || "Placeholder Name",
            email: userData.email || "guest@example.com",
            storeCurrency,
          });
          localStorage.setItem("storeCurrency", storeCurrency.toString()); // Initialize in localStorage
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        const storeCurrency = parseInt(localStorage.getItem("storeCurrency") || "0", 10); // Fallback to localStorage
        setUserData({
          name: localStorage.getItem("userName") || "Placeholder Name",
          email: localStorage.getItem("userEmail") || "guest@example.com",
          storeCurrency,
        });
      }
    }
  };

  fetchUserData();
}, []);

  const handleLogout = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("storeCurrency");
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
          <span className="truncate text-base font-semibold text-white">
            {userData.name}
          </span>
          <span className="truncate text-xs text-stone-400">
            {userData.email}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <Coins className="size-4 text-emerald-400" />
            <span className="text-xs text-emerald-300">
              {userData.storeCurrency.toLocaleString()} Carbon Credits
            </span>
          </div>
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
            <div className="flex items-center gap-1 mt-1">
              <Coins className="size-4 text-emerald-400" />
              <span className="text-xs text-emerald-300">
                {userData.storeCurrency.toLocaleString()} Carbon Credits
              </span>
            </div>
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
    [userData.name, userData.email, handleLogout, router]
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
          
          {/* New Carbon Credits Section with more spacing */}
          <div className="px-4 py-3 flex items-center text-emerald-300 text-xs border-b border-stone-800">
            <Coins className="mr-2 size-4 text-emerald-400" />
            Carbon Credits
            <span className="ml-auto font-bold">
              {userData.storeCurrency.toLocaleString()}
            </span>
          </div>
          <SidebarGroupLabel className="px-4 py-3 font-semibold text-stone-400">
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        "group relative flex items-center space-x-3 px-4 py-5 transition-colors",
                        pathname === item.url
                          ? "bg-stone-800 text-white"
                          : "text-stone-400 hover:bg-stone-800 hover:text-white"
                      )}
                      onClick={() => handleNavigate(item.url)}
                    >
                      <span>
                        <item.icon size={21} />
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-5 font-semibold text-stone-400">
            Recommendation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {recommendationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        "group relative flex items-center space-x-3 px-4 py-5 transition-colors",
                        pathname === item.url
                          ? "bg-stone-800 text-white"
                          : "text-stone-400 hover:bg-stone-800 hover:text-white"
                      )}
                      onClick={() => handleNavigate(item.url)}
                    >
                      <span>
                        <item.icon size={21} />
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {item.title}
                      </span>
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
