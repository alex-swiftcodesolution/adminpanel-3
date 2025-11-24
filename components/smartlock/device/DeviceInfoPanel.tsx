// components/smartlock/device/DeviceInfoPanel.tsx

"use client";

import { useState, useEffect } from "react";
import { DeviceInfo } from "@/lib/tuya/tuya-api-wrapper";
import { Info, Wifi, WifiOff, Copy, CheckCircle, Key } from "lucide-react";

interface DeviceInfoPanelProps {
  deviceId: string;
}

export default function DeviceInfoPanel({ deviceId }: DeviceInfoPanelProps) {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string>("");

  useEffect(() => {
    fetchDeviceInfo();
  }, [deviceId]);

  const fetchDeviceInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/smartlock/device/info?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.success) {
        setDevice(data.data);
      }
    } catch (error) {
      console.error("Error fetching device info:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Device information not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Device Status</h3>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              device.online
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {device.online ? (
              <>
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-semibold">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-semibold">Offline</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Device Name</p>
            <p className="font-semibold text-gray-900">{device.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Category</p>
            <p className="font-semibold text-gray-900">{device.category}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Product ID</p>
            <p className="font-semibold text-gray-900">{device.product_id}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Sub Device</p>
            <p className="font-semibold text-gray-900">
              {device.sub ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>

      {/* IDs and Keys Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Identifiers & Keys
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Device ID
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm">
                {device.id}
              </code>
              <button
                onClick={() => copyToClipboard(device.id, "id")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                {copiedField === "id" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">UUID</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm">
                {device.uuid}
              </code>
              <button
                onClick={() => copyToClipboard(device.uuid, "uuid")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                {copiedField === "uuid" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1 flex items-center gap-1">
              <Key className="w-4 h-4" />
              Local Key (For Encryption)
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg font-mono text-sm">
                {device.local_key}
              </code>
              <button
                onClick={() => copyToClipboard(device.local_key, "local_key")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                {copiedField === "local_key" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              ⚠️ Keep this key secure. It's used for local
              encryption/decryption.
            </p>
          </div>
        </div>
      </div>

      {/* Device Status Data */}
      {device.status && device.status.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Device Status Data
          </h3>

          <div className="space-y-2">
            {device.status.map((status: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">
                  {status.code}
                </span>
                <code className="text-sm text-gray-900">
                  {JSON.stringify(status.value)}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
