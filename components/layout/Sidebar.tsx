// components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Key,
  Users,
  Fingerprint,
  DoorOpen,
  History,
  Image,
  Shield,
  Info,
  Lock,
  ArrowLeft,
} from "lucide-react";

interface SidebarProps {
  deviceId: string;
}

export default function Sidebar({ deviceId }: SidebarProps) {
  const pathname = usePathname();

  console.log("🎨 Sidebar rendering for device:", deviceId);

  const menuItems = [
    {
      name: "Overview",
      href: `/dashboard/${deviceId}`,
      icon: LayoutDashboard,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Passwords",
      href: `/dashboard/${deviceId}/passwords`,
      icon: Key,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      name: "Users",
      href: `/dashboard/${deviceId}/users`,
      icon: Users,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      name: "Unlock Methods",
      href: `/dashboard/${deviceId}/unlock-methods`,
      icon: Fingerprint,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Door Control",
      href: `/dashboard/${deviceId}/door-control`,
      icon: DoorOpen,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      name: "History",
      href: `/dashboard/${deviceId}/history`,
      icon: History,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      name: "Media",
      href: `/dashboard/${deviceId}/media`,
      icon: Image,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },

    {
      name: "Device Info",
      href: `/dashboard/${deviceId}/device-info`,
      icon: Info,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex flex-col">
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 mb-8 p-3">
        <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-900">Smart Lock</h1>
          <p className="text-xs text-gray-500">Management</p>
        </div>
      </div>

      {/* Device ID Display */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-1">Active Device</p>
        <p
          className="text-sm font-mono font-semibold text-gray-900 truncate"
          title={deviceId}
        >
          {deviceId}
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isActive
                  ? `${item.bgColor} ${item.color} font-semibold`
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Device
        </Link>
      </div>
    </aside>
  );
}
