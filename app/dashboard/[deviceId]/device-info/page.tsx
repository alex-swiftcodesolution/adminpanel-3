// app/dashboard/[deviceId]/device-info/page.tsx

"use client";

import DeviceInfoPanel from "@/components/smartlock/device/DeviceInfoPanel";
import { Info } from "lucide-react";
import { use } from "react";

interface PageProps {
  params: Promise<{ deviceId: string }>;
}

export default function DeviceInfoPage({ params }: PageProps) {
  const { deviceId } = use(params);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Info className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Device Information
            </h1>
            <p className="text-gray-500">Device ID: {deviceId}</p>
          </div>
        </div>

        {/* Device Info Panel */}
        <DeviceInfoPanel deviceId={deviceId} />
      </div>
    </div>
  );
}
