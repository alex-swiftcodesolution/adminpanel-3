// components/smartlock/door-control/RemoteMethodsConfig.tsx

"use client";

import { useState, useEffect } from "react";
import { RemoteUnlockMethod } from "@/lib/tuya/tuya-api-wrapper";
import { Settings, ToggleLeft, ToggleRight } from "lucide-react";

interface RemoteMethodsConfigProps {
  deviceId: string;
}

export default function RemoteMethodsConfig({
  deviceId,
}: RemoteMethodsConfigProps) {
  const [methods, setMethods] = useState<RemoteUnlockMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMethods();
  }, [deviceId]);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/smartlock/door-control/remote-methods?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.success) {
        setMethods(data.data);
      }
    } catch (error) {
      console.error("Error fetching remote methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (unlockType: number, currentState: boolean) => {
    try {
      const response = await fetch(
        "/api/smartlock/door-control/remote-methods",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            unlockType,
            isEnabled: !currentState,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchMethods();
      }
    } catch (error) {
      console.error("Error toggling method:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Remote Unlock Methods
        </h3>
      </div>

      {methods.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No remote unlock methods available
        </p>
      ) : (
        <div className="space-y-3">
          {methods.map(
            (
              method,
              index // Added index as fallback key
            ) => (
              <div
                key={method.unlock_type || index} // Fixed: Added key prop
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-900">
                    {method.unlock_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Type: {method.unlock_type}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleToggle(method.unlock_type, method.is_enabled)
                  }
                  className={`p-2 rounded-lg transition-colors ${
                    method.is_enabled
                      ? "text-green-600 hover:bg-green-50"
                      : "text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {method.is_enabled ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
