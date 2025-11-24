// components/smartlock/door-control/DoorControlPanel.tsx

"use client";

import { useState } from "react";
import { Lock, Unlock, ShieldAlert, CheckCircle } from "lucide-react";

interface DoorControlPanelProps {
  deviceId: string;
}

export default function DoorControlPanel({ deviceId }: DoorControlPanelProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"locked" | "unlocked" | "unknown">(
    "unknown"
  );
  const [message, setMessage] = useState("");

  const handleUnlock = async () => {
    if (!confirm("Are you sure you want to unlock the door?")) return;

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/smartlock/door-control/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("unlocked");
        setMessage("Door unlocked successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async () => {
    if (!confirm("Are you sure you want to lock the door?")) return;

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/smartlock/door-control/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("locked");
        setMessage("Door locked successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/smartlock/door-control/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Password-free unlock revoked successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
      <div className="text-center mb-8">
        <div
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
            status === "locked"
              ? "bg-red-100"
              : status === "unlocked"
              ? "bg-green-100"
              : "bg-gray-100"
          }`}
        >
          {status === "locked" ? (
            <Lock className="w-12 h-12 text-red-600" />
          ) : status === "unlocked" ? (
            <Unlock className="w-12 h-12 text-green-600" />
          ) : (
            <ShieldAlert className="w-12 h-12 text-gray-600" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Door Control</h2>
        <p className="text-gray-500">
          Status:{" "}
          <span
            className={`font-semibold ${
              status === "locked"
                ? "text-red-600"
                : status === "unlocked"
                ? "text-green-600"
                : "text-gray-600"
            }`}
          >
            {status === "locked"
              ? "Locked"
              : status === "unlocked"
              ? "Unlocked"
              : "Unknown"}
          </span>
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.includes("Error")
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {!message.includes("Error") && <CheckCircle className="w-5 h-5" />}
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleUnlock}
          disabled={loading}
          className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
        >
          <Unlock className="w-6 h-6" />
          {loading ? "Processing..." : "Unlock"}
        </button>

        <button
          onClick={handleLock}
          disabled={loading}
          className="px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
        >
          <Lock className="w-6 h-6" />
          {loading ? "Processing..." : "Lock"}
        </button>
      </div>

      <div className="mt-6">
        <button
          onClick={handleRevoke}
          disabled={loading}
          className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Revoke Password-Free Unlock
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-1">⚠️ Important:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Remote unlock requires internet connection</li>
          <li>Always verify door status after remote operations</li>
          <li>Use responsibly and ensure authorized access only</li>
        </ul>
      </div>
    </div>
  );
}
