/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/door-control/DoorControlPanel.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
  Battery,
  Clock,
} from "lucide-react";
import {
  extractDeviceStatus,
  DeviceLockStatus,
} from "@/lib/utils/device-status";

interface DoorControlPanelProps {
  deviceId: string;
}

export default function DoorControlPanel({ deviceId }: DoorControlPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<DeviceLockStatus>({
    lockState: "unknown",
    online: false,
    reportedOnline: false,
    battery: null,
    lastUpdate: null,
    isStale: true,
    timeAgo: "Unknown",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);

  useEffect(() => {
    fetchDeviceStatus();
  }, [deviceId]);

  const fetchDeviceStatus = async () => {
    try {
      setFetchingStatus(true);

      const response = await fetch(
        `/api/smartlock/device/info?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        // Use centralized utility to extract status
        const status = extractDeviceStatus(data.data);
        setDeviceStatus(status);
      }
    } catch (error) {
      console.error("Error fetching device status:", error);
    } finally {
      setFetchingStatus(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUnlock = async (withPassword: boolean = false) => {
    if (!confirm("Are you sure you want to unlock the door?")) return;

    try {
      setLoading("unlock");
      setMessage(null);

      const body: any = { deviceId };
      if (withPassword && password) {
        body.password = password;
      }

      const response = await fetch("/api/smartlock/door-control/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setDeviceStatus((prev) => ({ ...prev, lockState: "unlocked" }));
        showMessage("success", "Unlock command sent successfully!");
        setPassword("");
        setShowPasswordInput(false);
        setTimeout(fetchDeviceStatus, 2000);
      } else {
        showMessage("error", data.error || "Failed to unlock door");
      }
    } catch (error: any) {
      showMessage("error", error.message || "Failed to unlock door");
    } finally {
      setLoading(null);
    }
  };

  const handleLock = async () => {
    if (!confirm("Are you sure you want to lock the door?")) return;

    try {
      setLoading("lock");
      setMessage(null);

      const response = await fetch("/api/smartlock/door-control/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();

      if (data.success) {
        setDeviceStatus((prev) => ({ ...prev, lockState: "locked" }));
        showMessage("success", "Lock command sent successfully!");
        setTimeout(fetchDeviceStatus, 2000);
      } else {
        showMessage("error", data.error || "Failed to lock door");
      }
    } catch (error: any) {
      showMessage("error", error.message || "Failed to lock door");
    } finally {
      setLoading(null);
    }
  };

  const handleRevoke = async (type: 1 | 2 = 1) => {
    const typeLabel = type === 1 ? "reject" : "cancel";
    if (!confirm(`Are you sure you want to ${typeLabel} the unlock request?`))
      return;

    try {
      setLoading("revoke");
      setMessage(null);

      const response = await fetch("/api/smartlock/door-control/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, type }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", "Password-free unlock revoked successfully!");
      } else {
        showMessage("error", data.error || "Failed to revoke unlock");
      }
    } catch (error: any) {
      showMessage("error", error.message || "Failed to revoke unlock");
    } finally {
      setLoading(null);
    }
  };

  const { lockState, online, battery, isStale, timeAgo } = deviceStatus;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
      {/* Status Display */}
      <div className="text-center mb-8">
        <div
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
            lockState === "locked"
              ? "bg-red-100"
              : lockState === "unlocked"
              ? "bg-green-100"
              : "bg-gray-100"
          }`}
        >
          {fetchingStatus ? (
            <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
          ) : lockState === "locked" ? (
            <Lock className="w-12 h-12 text-red-600" />
          ) : lockState === "unlocked" ? (
            <Unlock className="w-12 h-12 text-green-600" />
          ) : (
            <ShieldAlert className="w-12 h-12 text-gray-600" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Door Control</h2>

        {/* Status Badges */}
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          {/* Lock Status */}
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              lockState === "locked"
                ? "bg-red-100 text-red-700"
                : lockState === "unlocked"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {lockState === "locked" ? (
              <Lock className="w-4 h-4" />
            ) : lockState === "unlocked" ? (
              <Unlock className="w-4 h-4" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
            {lockState === "locked"
              ? "Locked"
              : lockState === "unlocked"
              ? "Unlocked"
              : "Unknown"}
          </span>

          {/* Online Status */}
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              online ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {online ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            {online ? "Online" : "Offline"}
          </span>

          {/* Battery Status */}
          {battery !== null && (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                battery > 50
                  ? "bg-green-100 text-green-700"
                  : battery > 20
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <Battery className="w-4 h-4" />
              {battery}%
            </span>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchDeviceStatus}
            disabled={fetchingStatus}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh Status"
          >
            <RefreshCw
              className={`w-4 h-4 ${fetchingStatus ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Last Update Time */}
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Last updated: {timeAgo}</span>
          {isStale && (
            <span className="text-yellow-600 font-medium">(Stale)</span>
          )}
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "error"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Offline Warning */}
      {!online && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
          <div className="flex items-center gap-2 font-medium">
            <WifiOff className="w-5 h-5 shrink-0" />
            <span>Device appears to be offline</span>
          </div>
          <p className="text-sm mt-1 ml-7">
            {isStale
              ? `Last communication was ${timeAgo}. Commands will be queued and executed when device reconnects.`
              : "Remote operations may not work until the device reconnects."}
          </p>
        </div>
      )}

      {/* Password Input (Optional) */}
      {showPasswordInput && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Password (6 digits)
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={6}
              placeholder="Enter 6-digit password"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => {
                setShowPasswordInput(false);
                setPassword("");
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Control Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() =>
            showPasswordInput ? handleUnlock(true) : handleUnlock(false)
          }
          disabled={!!loading}
          className={`px-6 py-4 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-lg font-semibold ${
            !online
              ? "bg-green-400 hover:bg-green-500"
              : "bg-green-600 hover:bg-green-700"
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {loading === "unlock" ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Unlock className="w-6 h-6" />
          )}
          {loading === "unlock" ? "Unlocking..." : "Unlock"}
        </button>

        <button
          onClick={handleLock}
          disabled={!!loading}
          className={`px-6 py-4 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-lg font-semibold ${
            !online
              ? "bg-red-400 hover:bg-red-500"
              : "bg-red-600 hover:bg-red-700"
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {loading === "lock" ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Lock className="w-6 h-6" />
          )}
          {loading === "lock" ? "Locking..." : "Lock"}
        </button>
      </div>

      {/* Secondary Options */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setShowPasswordInput(!showPasswordInput)}
          disabled={!!loading}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          {showPasswordInput ? "Hide Password Input" : "Unlock with Password"}
        </button>
      </div>

      {/* Revoke Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          onClick={() => handleRevoke(1)}
          disabled={!!loading}
          className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          {loading === "revoke" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Revoking...
            </span>
          ) : (
            "Reject Unlock Request"
          )}
        </button>

        <button
          onClick={() => handleRevoke(2)}
          disabled={!!loading}
          className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          Cancel Unlock Request
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-1">⚠️ Important:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Remote unlock requires internet connection</li>
          <li>Always verify door status after remote operations</li>
          <li>Use responsibly and ensure authorized access only</li>
          <li>Password must be 6 digits when using password unlock</li>
          <li>Status may be delayed by up to 5 minutes</li>
        </ul>
      </div>
    </div>
  );
}
