// app/dashboard/[deviceId]/door-control/page.tsx

"use client";

import DoorControlPanel from "@/components/smartlock/door-control/DoorControlPanel";
import RemoteMethodsConfig from "@/components/smartlock/door-control/RemoteMethodsConfig";
import { DoorOpen } from "lucide-react";
import { use } from "react";

interface PageProps {
  params: Promise<{ deviceId: string }>;
}

export default function DoorControlPage({ params }: PageProps) {
  const { deviceId } = use(params);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <DoorOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Door Control</h1>
            <p className="text-gray-500">Device ID: {deviceId}</p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left column - Control Panel */}
          <div>
            <DoorControlPanel deviceId={deviceId} />
          </div>

          {/* Right column - Remote Methods Config */}
          <div>
            <RemoteMethodsConfig deviceId={deviceId} />
          </div>
        </div>
      </div>
    </div>
  );
}
