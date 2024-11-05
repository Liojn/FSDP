// src/components/shared/page-header.tsx
"use client";
import { SidebarTrigger } from "../ui/sidebar";

interface PageHeaderProps {
  title: string;
  className?: string;
}

export function PageHeader({ title, className = "" }: PageHeaderProps) {
  return (
    <div className={`top-0 z-10 bg-white ${className}`}>
      <div className="flex items-center gap-4 py-5">
        <span className="">
          <SidebarTrigger className="shrink-0" />
        </span>
        <div className="h-7 w-px bg-gray-300" /> {/* Vertical divider */}
        <h1 className="text-3xl font-bold ">{title}</h1>
      </div>
    </div>
  );
}
