/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/door-control/RemoteMethodsConfig.tsx

"use client";

import { useState, useEffect } from "react";
import { RemoteUnlockMethod } from "@/lib/tuya/tuya-api-wrapper";
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertCircle,
  WifiOff,
  CheckCircle,
} from "lucide-react";
import { calculateOnlineStatus } from "@/lib/utils/device-status";

interface RemoteMethodsConfigProps {
  deviceId: string;
}

const METHOD_LABELS: Record<string, string> = {
  remoteUnlockWithoutPwd: "Remote Unlock (No Password)",
  remoteUnlockWithPwd: "Remote Unlock (With Password)",
};

const METHOD_DESCRIPTIONS: Record<string, string> = {
  remoteUnlockWithoutPwd:
    "One-click remote unlock without password verification",
  remoteUnlockWithPwd: "Requires password confirmation before unlocking",
};

export default function RemoteMethodsConfig({
  deviceId,
}: RemoteMethodsConfigProps) {
  const [methods, setMethods] = useState<RemoteUnlockMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    fetchMethods();
    fetchDeviceStatus();
  }, [deviceId]);

  const fetchDeviceStatus = async () => {
    try {
      const response = await fetch(
        `/api/smartlock/device/info?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        // Use centralized utility - online is already calculated by API
        setIsOnline(data.data.online || false);
      }
    } catch (err) {
      console.error("Error fetching device status:", err);
    }
  };

  const fetchMethods = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/smartlock/door-control/remote-methods?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.success) {
        setMethods(data.data);
      } else {
        setError(data.error || "Failed to fetch remote methods");
      }
    } catch (err: any) {
      console.error("Error fetching remote methods:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (
    remoteUnlockType: string,
    currentState: boolean
  ) => {
    try {
      setUpdating(remoteUnlockType);
      setError(null);
      setSuccess(null);

      const newState = !currentState;

      const response = await fetch(
        "/api/smartlock/door-control/remote-methods",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            remote_unlock_type: remoteUnlockType,
            open: newState,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const action = newState ? "enabled" : "disabled";
        const methodName = METHOD_LABELS[remoteUnlockType] || remoteUnlockType;

        if (!isOnline) {
          setSuccess(
            `${methodName} will be ${action} when device comes online`
          );
        } else {
          setSuccess(`${methodName} ${action} successfully`);
        }

        setTimeout(() => setSuccess(null), 3000);
        await fetchMethods();
      } else {
        setError(data.error || "Failed to update setting");
      }
    } catch (err: any) {
      console.error("Error toggling method:", err);
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Remote Unlock Methods
          </h3>
        </div>
        <button
          onClick={() => {
            fetchMethods();
            fetchDeviceStatus();
          }}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            Device is offline. Changes will apply when device reconnects.
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Methods List */}
      {methods.length === 0 ? (
        <div className="text-center py-8">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No remote unlock methods available</p>
          <p className="text-gray-400 text-sm mt-1">
            This device may not support remote unlocking
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map((method, index) => (
            <div
              key={method.remote_unlock_type || index}
              className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                !isOnline
                  ? "bg-gray-100 opacity-75"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {METHOD_LABELS[method.remote_unlock_type] ||
                    method.remote_unlock_type}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {METHOD_DESCRIPTIONS[method.remote_unlock_type] ||
                    `Type: ${method.remote_unlock_type}`}
                </p>
                <p className="text-xs mt-1">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      method.open ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {method.open ? "Enabled" : "Disabled"}
                  </span>
                </p>
              </div>

              <button
                onClick={() =>
                  handleToggle(method.remote_unlock_type, method.open)
                }
                disabled={updating === method.remote_unlock_type}
                className={`p-2 rounded-lg transition-colors ml-4 ${
                  method.open
                    ? "text-green-600 hover:bg-green-50"
                    : "text-gray-400 hover:bg-gray-200"
                } ${
                  updating === method.remote_unlock_type
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title={method.open ? "Disable" : "Enable"}
              >
                {updating === method.remote_unlock_type ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : method.open ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-medium mb-2">ℹ️ About Remote Unlock Methods:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            <strong>With Password:</strong> More secure, requires password
            verification
          </li>
          <li>
            <strong>Without Password:</strong> Convenient one-click unlock
          </li>
          <li>Enable only the methods you need for security</li>
          <li>Changes require device to be online to take effect</li>
        </ul>
      </div>
    </div>
  );
}
