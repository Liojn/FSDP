import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "EcoFarm",
  description: "EcoFarm App",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto px-4 py-6">
                <SidebarTrigger className=" mb-4" />
                {children}
              </div>
            </main>
         
        </SidebarProvider>
      </body>
    </html>
  )
}