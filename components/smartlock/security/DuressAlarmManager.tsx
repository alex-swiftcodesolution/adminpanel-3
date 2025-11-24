// components/smartlock/security/DuressAlarmManager.tsx

"use client";

import { useState, useEffect } from "react";
import { UnlockMethod } from "@/lib/tuya/tuya-api-wrapper";
import { ShieldAlert, Plus, Trash2, AlertTriangle } from "lucide-react";

interface DuressAlarmManagerProps {
  deviceId: string;
}

export default function DuressAlarmManager({
  deviceId,
}: DuressAlarmManagerProps) {
  const [methods, setMethods] = useState<UnlockMethod[]>([]);
  const [duressMethods, setDuressMethods] = useState<UnlockMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, [deviceId]);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/smartlock/unlock-methods?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        // Ensure data.data is an array
        const allMethods = Array.isArray(data.data) ? data.data : [];
        setMethods(allMethods);
        setDuressMethods(allMethods.filter((m: UnlockMethod) => m.is_hijack));
      } else {
        setMethods([]);
        setDuressMethods([]);
      }
    } catch (error) {
      console.error("Error fetching methods:", error);
      setMethods([]);
      setDuressMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDuress = async (method: UnlockMethod) => {
    try {
      const response = await fetch("/api/smartlock/security/duress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          unlockType: method.unlock_type,
          unlockNo: method.unlock_no,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddModal(false);
        fetchMethods();
      }
    } catch (error) {
      console.error("Error adding duress alarm:", error);
    }
  };

  const handleRemoveDuress = async (method: UnlockMethod) => {
    if (!confirm("Are you sure you want to remove this duress alarm?")) return;

    try {
      const response = await fetch(
        `/api/smartlock/security/duress?deviceId=${deviceId}&unlockType=${method.unlock_type}&unlockSn=${method.unlock_sn}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        fetchMethods();
      }
    } catch (error) {
      console.error("Error removing duress alarm:", error);
    }
  };

  const availableMethods = methods.filter((m) => !m.is_hijack);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">
              What is a Duress Alarm?
            </h3>
            <p className="text-sm text-red-800 mb-2">
              A duress alarm is a silent security feature that allows you to
              unlock the door under duress while secretly alerting your
              emergency contacts or security system.
            </p>
            <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
              <li>
                The door will unlock normally when the duress method is used
              </li>
              <li>
                A silent alarm is triggered to alert authorities or contacts
              </li>
              <li>
                The person forcing entry will not know an alarm was triggered
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Active Duress Methods */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Active Duress Alarms
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Duress Alarm
          </button>
        </div>

        {duressMethods.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No duress alarms configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            {duressMethods.map((method) => (
              <div
                key={method.unlock_sn}
                className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {method.unlock_name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Type: {method.unlock_type} • Number: {method.unlock_no}
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveDuress(method)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Remove duress alarm"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Duress Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Duress Alarm
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Select an unlock method to set as a duress alarm:
              </p>

              {availableMethods.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No available methods to configure
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableMethods.map((method) => (
                    <button
                      key={method.unlock_sn}
                      onClick={() => handleAddDuress(method)}
                      className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                      <h4 className="font-semibold text-gray-900">
                        {method.unlock_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Type: {method.unlock_type} • Number: {method.unlock_no}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
