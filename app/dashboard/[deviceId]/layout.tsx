// app/dashboard/[deviceId]/layout.tsx

import DashboardLayout from "@/components/layout/DashboardLayout";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ deviceId: string }>; // Changed to Promise
}

export default async function DeviceLayout({ children, params }: LayoutProps) {
  const { deviceId } = await params; // Await the params

  console.log("🔧 Layout rendering for device:", deviceId);

  return <DashboardLayout deviceId={deviceId}>{children}</DashboardLayout>;
}
