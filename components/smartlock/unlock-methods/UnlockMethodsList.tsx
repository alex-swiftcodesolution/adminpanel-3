// components/smartlock/unlock-methods/UnlockMethodsList.tsx

"use client";

import { useState, useEffect } from "react";
import { UnlockMethod } from "@/lib/tuya/tuya-api-wrapper";
import {
  Key,
  Fingerprint,
  CreditCard,
  Smartphone,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { ensureArray } from "@/lib/utils/array-helpers";

interface UnlockMethodsListProps {
  deviceId: string;
  userId?: string;
  onAssign?: (method: UnlockMethod) => void;
}

export default function UnlockMethodsList({
  deviceId,
  userId,
  onAssign,
}: UnlockMethodsListProps) {
  const [methods, setMethods] = useState<UnlockMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, [deviceId, userId]);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const url = userId
        ? `/api/smartlock/unlock-methods?deviceId=${deviceId}&userId=${userId}`
        : `/api/smartlock/unlock-methods?deviceId=${deviceId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.data) {
        // Ensure data.data is an array
        setMethods(ensureArray(data.data));
      } else {
        setMethods([]);
      }
    } catch (error) {
      console.error("Error fetching unlock methods:", error);
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await fetch("/api/smartlock/unlock-methods/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();

      if (data.success) {
        fetchMethods();
      }
    } catch (error) {
      console.error("Error syncing unlock methods:", error);
    } finally {
      setSyncing(false);
    }
  };

  const getMethodIcon = (type: number) => {
    const icons: Record<number, any> = {
      0: Key,
      1: Fingerprint,
      2: CreditCard,
      3: Smartphone,
    };
    const Icon = icons[type] || Key;
    return <Icon className="w-5 h-5" />;
  };

  const getMethodTypeName = (type: number) => {
    const types: Record<number, string> = {
      0: "Password",
      1: "Fingerprint",
      2: "Card",
      3: "Bluetooth",
      4: "Face Recognition",
      5: "Key",
    };
    return types[type] || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {userId ? "Assigned Unlock Methods" : "Available Unlock Methods"}
        </h2>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Methods"}
        </button>
      </div>

      {methods.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Key className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No unlock methods found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {methods.map((method) => (
            <div
              key={method.unlock_sn}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    {getMethodIcon(method.unlock_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {method.unlock_name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {getMethodTypeName(method.unlock_type)}
                    </span>
                  </div>
                </div>

                {method.is_hijack && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    Duress
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>Serial Number: {method.unlock_sn}</p>
                <p>Method Number: {method.unlock_no}</p>
              </div>

              {onAssign && (
                <button
                  onClick={() => onAssign(method)}
                  className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Assign to User
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
