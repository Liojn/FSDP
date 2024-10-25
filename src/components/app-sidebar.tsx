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
  logo: "/path/to/your/logo.png",
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
    name: "Placeholder Name",
    email: "placeholder.email@example.com",
    avatarUrl: "https://via.placeholder.com/150",
  };

  const handleLogout = async () => {
    try {
      // Add your logout logic here
      console.log("Logging out...");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavigate = (url: string) => {
    // Add any additional navigation logic here
    console.log(`Navigating to ${url}`);
  };

  const handleNotifications = () => {
    // Add notifications handling logic
    console.log("Opening notifications...");
  };

  const handleAccountSettings = () => {
    // Add account settings logic
    console.log("Opening account settings...");
  };

  return (
    <Sidebar className="border-r border-stone-800 bg-stone-900">
      <SidebarHeader className="px-6 py-5">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          {!imageError ? (
            <Image
              src={appConfig.logo}
              alt={`${appConfig.name} Logo`}
              width={20}
              height={20}
              className="size-2"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-lg font-bold">
              {appConfig.name.charAt(0)}
            </span>
          )}
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
                    <Link
                      href={item.url}
                      className={`flex space-x-1 px-4 py-5 transition-colors hover:bg-stone-100  ${
                        pathname === item.url
                          ? "bg-stone-800 text-white"
                          : "text-white hover:text-stone-950"
                      }`}
                      onClick={() => handleNavigate(item.url)}
                    >
                      <span>{item.icon && <item.icon size={21} />}</span>

                      <span className="text-base">{item.title}</span>
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
                  <DropdownMenuItem
                    className="flex items-center gap-2 py-2"
                    onClick={handleAccountSettings}
                  >
                    <BadgeCheck className="size-4" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 py-2 hover:text-white"
                    onClick={handleNotifications}
                  >
                    <Bell className="size-4" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="border-stone-800" />

                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-400 hover:text-red-300"
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
