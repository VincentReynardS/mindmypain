"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarHeart, Pill, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function PatientBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/journal",
      icon: Home,
    },
    {
      label: "Appointments",
      href: "/appointments",
      icon: CalendarHeart,
    },
    {
      label: "Medications",
      href: "/medications",
      icon: Pill,
    },
    {
      label: "Scripts",
      href: "/scripts",
      icon: FileText,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-calm-surface-raised bg-calm-surface-raised pb-[env(safe-area-inset-bottom)]" aria-label="Bottom Navigation">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-12 min-w-12 flex-col items-center justify-center space-y-1 p-2 transition-colors duration-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue",
              isActive ? "text-calm-blue" : "text-calm-text-muted hover:text-calm-text"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
