"use client"; // Ensure this component is treated as a Client Component

import { SidebarProvider } from "@/components/ui/sidebar";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const AppSidebar = dynamic(() => import("@/components/shared/app-sidebar"));

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [shouldShowSidebar, setShouldShowSidebar] = useState(
    pathname !== "/login" && pathname !== "/signup"
  );

  useEffect(() => {
    setShouldShowSidebar(pathname !== "/login" && pathname !== "/signup");
  }, [pathname]);

  return (
    <SidebarProvider>
      {shouldShowSidebar && <AppSidebar />}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto px-4 py-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
