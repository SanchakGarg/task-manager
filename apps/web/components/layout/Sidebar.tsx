"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, CheckSquare, Bell, Settings, LogOut,
  ChevronLeft, ChevronRight, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/tasks", icon: CheckSquare, label: "All Tasks" },
  { href: "/dashboard/reminders", icon: Bell, label: "Reminders" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ session }: { session: Session }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col bg-white border-r-2 border-nb-border h-full overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b-2 border-nb-border h-16">
        <div className="w-9 h-9 flex-shrink-0 bg-nb-primary rounded-nb flex items-center justify-center border-2 border-nb-border shadow-nb-sm">
          <Zap size={18} className="text-white" strokeWidth={2.5} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-black text-lg tracking-tight whitespace-nowrap"
            >
              TaskFlow
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-nb font-bold text-sm transition-all duration-150",
                  active
                    ? "bg-nb-primary text-white border-2 border-nb-border shadow-nb-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border-2 border-transparent"
                )}
              >
                <Icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t-2 border-nb-border space-y-2">
        <div className={cn("flex items-center gap-3 px-2 py-1", collapsed && "justify-center")}>
          {session.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? "User"}
              className="w-8 h-8 rounded-full border-2 border-nb-border flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-nb-border bg-nb-accent flex items-center justify-center flex-shrink-0 font-black text-sm">
              {session.user?.name?.[0] ?? "?"}
            </div>
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <p className="text-sm font-bold truncate">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn("w-full text-muted-foreground hover:text-nb-danger", collapsed ? "justify-center" : "justify-start gap-2")}
        >
          <LogOut size={16} />
          {!collapsed && "Sign out"}
        </Button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-20 w-8 h-8 bg-white border-2 border-nb-border rounded-full flex items-center justify-center shadow-nb-sm hover:shadow-nb transition-shadow z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  );
}
