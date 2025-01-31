"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

import AppSidebar from "@/components/shared/app-sidebar";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Modify the condition to exclude the root path (`/`) along with `/login` and `/signup` and `landing`
  const shouldShowSidebar =
    pathname !== "/" &&
    pathname !== "/login" &&
    pathname !== "/signup" &&
    pathname !== "/landing";

  return (
    <SidebarProvider>
      {shouldShowSidebar && <AppSidebar />}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto ">{children}</div>
      </main>
    </SidebarProvider>
  );
}
