/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

interface TuyaDevice {
  id: string;
  name: string;
  category: string;
  online: boolean;
  product_name?: string;
  icon?: string;
}

export default function DeviceSelectionPage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState("");
  const [devices, setDevices] = useState<TuyaDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/smartlock/devices/list");
      const data = await response.json();

      if (data.success) {
        // Filter for smart locks (you can adjust categories as needed)
        const locks = data.data.filter(
          (device: TuyaDevice) =>
            device.category === "ms" || // Smart lock
            device.category === "jtmspro" || // Smart lock pro
            device.category === "mk" || // Access control
            device.name?.toLowerCase().includes("lock") ||
            device.name?.toLowerCase().includes("door")
        );

        setDevices(locks.length > 0 ? locks : data.data); // If no locks found, show all devices
      } else {
        setError(data.error || "Failed to fetch devices");
      }
    } catch (error: any) {
      console.error("Error fetching devices:", error);
      setError(error.message || "Failed to connect to Tuya API");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deviceId.trim()) {
      router.push(`/dashboard/${deviceId.trim()}`);
    }
  };

  const handleDeviceClick = (id: string) => {
    router.push(`/dashboard/${id}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Smart Lock Manager
          </h1>
          <p className="text-gray-600">
            Select a device to manage your smart lock
          </p>
        </div>

        {/* Manual Device ID Input */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Device ID Manually
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="Enter device ID (e.g., bf796cfd1a43fb440fnven)"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!deviceId.trim()}
              className="w-full px-6 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg"
            >
              Access Dashboard
            </button>
          </form>
        </div>

        {/* Your Devices */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Devices
            </h2>
            <button
              onClick={fetchDevices}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh devices"
            >
              <Loader2
                className={`w-5 h-5 text-gray-600 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500">Loading your devices...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <p className="text-red-800 font-semibold mb-2">
                Error Loading Devices
              </p>
              <p className="text-red-700 text-sm mb-4">{error}</p>
              <button
                onClick={fetchDevices}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>

              {/* Help Text */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <p className="text-sm text-yellow-800 font-semibold mb-2">
                  💡 Troubleshooting:
                </p>
                <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Verify TUYA_APP_ACCOUNT_UID is set in .env.local</li>
                  <li>
                    Check that your API credentials have proper permissions
                  </li>
                  <li>Ensure devices are added to your Tuya account</li>
                  <li>Try entering the device ID manually above</li>
                </ul>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && devices.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold mb-2">
                No Devices Found
              </p>
              <p className="text-gray-500 text-sm mb-4">
                No smart locks found in your Tuya account
              </p>
              <p className="text-xs text-gray-400">
                You can still enter a device ID manually above
              </p>
            </div>
          )}

          {/* Devices List */}
          {!loading && devices.length > 0 && (
            <div className="space-y-2">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => handleDeviceClick(device.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {device.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-mono truncate">{device.id}</span>
                        {device.category && (
                          <span className="px-2 py-0.5 bg-gray-200 rounded">
                            {device.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {device.online ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          <Wifi className="w-3 h-3" />
                          Online
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          <WifiOff className="w-3 h-3" />
                          Offline
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Powered by Tuya IoT Platform • Secure & Reliable
          </p>
        </div>
      </div>
    </div>
  );
}
