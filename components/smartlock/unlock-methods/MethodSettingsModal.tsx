/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/unlock-methods/MethodSettingsModal.tsx

"use client";

import { useState } from "react";
import { Settings, X, Camera, Mic, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MethodSettingsModalProps {
  deviceId: string;
  method: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MethodSettingsModal({
  deviceId,
  method,
  onSuccess,
  onCancel,
}: MethodSettingsModalProps) {
  const [settings, setSettings] = useState({
    photoCapture: method.photo_unlock === 2,
    voiceControl: method.voice_attr === 1,
    duressAlarm: method.unlock_attr === 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      // Update photo capture attribute
      if (settings.photoCapture !== (method.photo_unlock === 2)) {
        await fetch(
          `/api/smartlock/unlock-methods/${method.unlock_sn}/attributes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceId,
              attribute: 2, // Photo capture
              enabled: settings.photoCapture,
            }),
          }
        );
      }

      // Update unlock method with duress settings
      const response = await fetch(
        `/api/smartlock/unlock-methods/${method.unlock_sn}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            dpCode: method.dp_code,
            unlockAttr: settings.duressAlarm ? 1 : 0,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log("✅ Settings updated successfully");
        onSuccess?.();
      } else {
        setError(data.error || "Failed to update settings");
      }
    } catch (error: any) {
      console.error("❌ Error updating settings:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Method Settings
            </CardTitle>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <Separator className="bg-neutral-200" />

        <CardContent className="pt-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Method Info */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
            <p className="text-sm font-medium text-neutral-900">
              {method.unlock_name}
            </p>
            <p className="text-xs text-neutral-500">SN: {method.unlock_sn}</p>
          </div>

          {/* Photo Capture Setting */}
          <div className="flex items-start gap-3 p-4 border border-neutral-200 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-neutral-900">
                  Photo Capture
                </h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.photoCapture}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        photoCapture: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p className="text-xs text-neutral-500">
                Capture photo when this method is used to unlock
              </p>
            </div>
          </div>

          {/* Voice Control Setting */}
          <div className="flex items-start gap-3 p-4 border border-neutral-200 rounded-lg opacity-50">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mic className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-neutral-900">
                  Voice Control
                </h4>
                <label className="relative inline-flex items-center cursor-not-allowed">
                  <input
                    type="checkbox"
                    checked={settings.voiceControl}
                    disabled
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 rounded-full"></div>
                </label>
              </div>
              <p className="text-xs text-neutral-500">
                Voice control settings (read-only)
              </p>
            </div>
          </div>

          {/* Duress Alarm Setting */}
          <div className="flex items-start gap-3 p-4 border border-neutral-200 rounded-lg">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-neutral-900">
                  Duress Alarm
                </h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.duressAlarm}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        duressAlarm: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
              <p className="text-xs text-neutral-500">
                Trigger silent alarm when this method is used
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-neutral-900 hover:bg-neutral-800"
            >
              <Settings className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
