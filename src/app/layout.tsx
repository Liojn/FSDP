import type { Metadata } from "next";
import "./globals.css";
// Client-side component
import ClientLayout from "./layouts/client-layout"; // Import the client layout component
import { Toaster } from "@/components/ui/toaster";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const metadata: Metadata = {
  title: "EcoFarm",
  description: "EcoFarm App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
