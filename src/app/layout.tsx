import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./layouts/client-layout";
import { Toaster } from "@/components/ui/toaster";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { DataProvider } from "@/context/DataContext";

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
        <DataProvider>
          {" "}
          {/* Wrap children with DataProvider */}
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </DataProvider>
      </body>
    </html>
  );
}
