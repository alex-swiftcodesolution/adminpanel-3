// components/layout/DashboardLayout.tsx

"use client";

import Sidebar from "./Sidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  deviceId: string;
}

export default function DashboardLayout({
  children,
  deviceId,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar deviceId={deviceId} />
      <main className="flex-1 lg:ml-0">{children}</main>
    </div>
  );
}
