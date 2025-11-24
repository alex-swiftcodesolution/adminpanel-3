// app/dashboard/[deviceId]/unlock-methods/page.tsx

"use client";

import { use, useState } from "react";
import UnlockMethodsList from "@/components/smartlock/unlock-methods/UnlockMethodsList";
import EnrollMethodForm from "@/components/smartlock/unlock-methods/EnrollMethodForm";
import { Key, Plus } from "lucide-react";

interface PageProps {
  params: Promise<{ deviceId: string }>;
}

export default function UnlockMethodsPage({ params }: PageProps) {
  const { deviceId } = use(params);

  const [refreshKey, setRefreshKey] = useState(0);
  const [showEnrollForm, setShowEnrollForm] = useState(false);

  const handleMethodEnrolled = () => {
    setShowEnrollForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Key className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Unlock Methods
              </h1>
              <p className="text-gray-500">Device ID: {deviceId}</p>
            </div>
          </div>

          <button
            onClick={() => setShowEnrollForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Enroll New Method
          </button>
        </div>

        {/* Methods List */}
        <UnlockMethodsList key={refreshKey} deviceId={deviceId} />

        {/* Enroll Method Modal */}
        {showEnrollForm && (
          <EnrollMethodForm
            deviceId={deviceId}
            onSuccess={handleMethodEnrolled}
            onCancel={() => setShowEnrollForm(false)}
          />
        )}
      </div>
    </div>
  );
}
