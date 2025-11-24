// app/dashboard/[deviceId]/security/page.tsx

"use client";

import DuressAlarmManager from "@/components/smartlock/security/DuressAlarmManager";
import { Shield } from "lucide-react";
import { use } from "react";

interface PageProps {
  params: Promise<{ deviceId: string }>;
}

export default function SecurityPage({ params }: PageProps) {
  const { deviceId } = use(params);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Security Settings
            </h1>
            <p className="text-gray-500">Device ID: {deviceId}</p>
          </div>
        </div>

        {/* Duress Alarm Manager */}
        <DuressAlarmManager deviceId={deviceId} />
      </div>
    </div>
  );
}
