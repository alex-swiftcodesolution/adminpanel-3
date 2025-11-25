// components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Key,
  Users,
  Fingerprint,
  DoorOpen,
  History,
  Image,
  Info,
  Lock,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

interface SidebarProps {
  deviceId: string;
}

export default function Sidebar({ deviceId }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Overview",
      href: `/dashboard/${deviceId}`,
      icon: LayoutDashboard,
    },
    {
      name: "Passwords",
      href: `/dashboard/${deviceId}/passwords`,
      icon: Key,
    },
    {
      name: "Users",
      href: `/dashboard/${deviceId}/users`,
      icon: Users,
    },
    {
      name: "Unlock Methods",
      href: `/dashboard/${deviceId}/unlock-methods`,
      icon: Fingerprint,
    },
    {
      name: "Door Control",
      href: `/dashboard/${deviceId}/door-control`,
      icon: DoorOpen,
    },
    {
      name: "History",
      href: `/dashboard/${deviceId}/history`,
      icon: History,
    },
    {
      name: "Media",
      href: `/dashboard/${deviceId}/media`,
      icon: Image,
    },
    {
      name: "Device Info",
      href: `/dashboard/${deviceId}/device-info`,
      icon: Info,
    },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 p-4">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className="p-2 bg-foreground rounded-lg"
        >
          <Lock className="w-5 h-5 text-background" />
        </motion.div>
        <div>
          <h1 className="font-bold text-base text-foreground">Smart Lock</h1>
          <p className="text-xs text-muted-foreground">Management</p>
        </div>
      </div>

      <Separator />

      {/* Device ID Display */}
      <div className="p-4">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Active Device</p>
          <p
            className="text-xs font-mono font-semibold truncate"
            title={deviceId}
          >
            {deviceId}
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-sm"
          asChild
        >
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Device
          </Link>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-foreground rounded-lg">
            <Lock className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="font-bold text-sm">Smart Lock</h1>
            <p className="text-xs text-muted-foreground">Management</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : "-100%",
        }}
        transition={{ type: "spring", damping: 20 }}
        className="lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-card border-r z-40 flex flex-col"
      >
        <SidebarContent />
      </motion.aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r bg-card flex-col min-h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Spacer for mobile */}
      <div className="lg:hidden h-16" />
    </>
  );
}
