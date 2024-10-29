"use client"; // Ensure this component is treated as a Client Component

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { useEffect, useState } from "react";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [shouldShowSidebar, setShouldShowSidebar] = useState(false);

  // Update sidebar visibility once the component mounts and we can access the pathname
  useEffect(() => {
    const pathname = window.location.pathname; // Use window.location instead of usePathname on mount
    setShouldShowSidebar(pathname !== "/login" && pathname !== "/signup");
  }, []);

  return (
    <SidebarProvider>
      {shouldShowSidebar && <AppSidebar />} {/* Show sidebar conditionally */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto px-4 py-6">
          {shouldShowSidebar && (
            <span className="">
              <SidebarTrigger className=" mb-4" />
            </span>
          )}
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
