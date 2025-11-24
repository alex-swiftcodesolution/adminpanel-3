// app/dashboard/[deviceId]/history/page.tsx

"use client";

import { use, useState } from "react";
import UnlockHistoryList from "@/components/smartlock/history/UnlockHistoryList";
import AlarmHistoryList from "@/components/smartlock/history/AlarmHistoryList";
import CombinedHistoryList from "@/components/smartlock/history/CombinedHistoryList";
import { History, Unlock, AlertTriangle, List } from "lucide-react";

interface PageProps {
  params: Promise<{ deviceId: string }>;
}

export default function HistoryPage({ params }: PageProps) {
  const { deviceId } = use(params);
  const [activeTab, setActiveTab] = useState<"combined" | "unlocks" | "alarms">(
    "unlocks"
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <History className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">History & Logs</h1>
            <p className="text-gray-500">Device ID: {deviceId}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 inline-flex gap-1">
          {/* <button
            onClick={() => setActiveTab("combined")}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "combined"
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <List className="w-5 h-5" />
            All Records
          </button> */}
          <button
            onClick={() => setActiveTab("unlocks")}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "unlocks"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Unlock className="w-5 h-5" />
            Unlock History
          </button>
          <button
            onClick={() => setActiveTab("alarms")}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "alarms"
                ? "bg-red-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Alarm History
          </button>
        </div>

        {/* Content */}
        {/* {activeTab === "combined" && (
          <CombinedHistoryList deviceId={deviceId} />
        )} */}
        {activeTab === "unlocks" && <UnlockHistoryList deviceId={deviceId} />}
        {activeTab === "alarms" && <AlarmHistoryList deviceId={deviceId} />}
      </div>
    </div>
  );
}
