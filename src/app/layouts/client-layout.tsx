"use client"; // The "use client" directive must be at the top of the client-side file

import { usePathname } from "next/navigation"; // Import client-side hooks
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Get the current path

  // Determine if we should show the sidebar
  const shouldShowSidebar = pathname !== "/login" && pathname !== "/signup";

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
