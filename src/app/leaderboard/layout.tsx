"use client"

import React from 'react'
import { AppSidebar } from '@/components/app-sidebar' // Your existing sidebar
import RightSidebar from '@/components/RideSidebar' // The new right sidebar

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <main className="flex-1 p-4">
          {children}
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  )
}
