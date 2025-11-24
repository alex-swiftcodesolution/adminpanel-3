/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/unlock-methods/EditUnlockMethodModal.tsx

"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface EditUnlockMethodModalProps {
  deviceId: string;
  method: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditUnlockMethodModal({
  deviceId,
  method,
  onSuccess,
  onCancel,
}: EditUnlockMethodModalProps) {
  const [formData, setFormData] = useState({
    unlockName: method.unlock_name || "",
    unlockAttr: method.unlock_attr || 0,
    notifyApp: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const requestData: any = {
        deviceId,
      };

      // Only send changed fields
      if (formData.unlockName !== method.unlock_name) {
        requestData.unlockName = formData.unlockName;
      }
      if (method.dp_code) {
        requestData.dpCode = method.dp_code;
      }
      if (formData.unlockAttr !== method.unlock_attr) {
        requestData.unlockAttr = formData.unlockAttr;
      }
      requestData.notifyInfo = {
        app_send: formData.notifyApp,
      };

      console.log("📝 Updating unlock method:", {
        unlockSn: method.unlock_sn,
        requestData,
      });

      const response = await fetch(
        `/api/smartlock/unlock-methods/${method.unlock_sn}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log("✅ Method updated successfully");
        onSuccess?.();
      } else {
        setError(data.error || "Failed to update unlock method");
      }
    } catch (error: any) {
      console.error("❌ Error updating method:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Handle both unlock_type and dp_code
  const getMethodTypeName = (type?: string) => {
    if (!type) return "Unknown";

    const nameMap: Record<string, string> = {
      password: "Password",
      unlock_password: "Password",
      fingerprint: "Fingerprint",
      unlock_fingerprint: "Fingerprint",
      card: "Card/Fob",
      unlock_card: "Card/Fob",
      remoteControl: "Remote Control",
      unlock_telecontrol_kit: "Remote Control",
      face: "Face Recognition",
      unlock_face: "Face Recognition",
      hand: "Palm Print",
      unlock_hand: "Palm Print",
      finger_vein: "Finger Vein",
      unlock_finger_vein: "Finger Vein",
      eye: "Iris Recognition",
      unlock_eye: "Iris Recognition",
      key: "Physical Key",
    };
    return (
      nameMap[type.toLowerCase()] ||
      type.charAt(0).toUpperCase() + type.slice(1)
    );
  };

  // ✅ Get the type from either unlock_type or dp_code
  const methodType = method.unlock_type || method.dp_code;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Edit Unlock Method
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

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Method Info (Read-only) */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Type:</span>
                <span className="font-medium text-neutral-900">
                  {getMethodTypeName(methodType)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Slot Number:</span>
                <span className="font-mono font-medium text-neutral-900">
                  #{method.unlock_no || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Serial Number:</span>
                <span className="font-mono font-medium text-neutral-900">
                  {method.unlock_sn}
                </span>
              </div>
              {method.user_name && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Assigned to:</span>
                  <span className="font-medium text-neutral-900">
                    {method.user_name}
                  </span>
                </div>
              )}
            </div>

            {/* Method Name */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Method Name
              </label>
              <input
                type="text"
                value={formData.unlockName}
                onChange={(e) =>
                  setFormData({ ...formData, unlockName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder={`${getMethodTypeName(methodType)} ${
                  method.unlock_no || ""
                }`}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Give this unlock method a custom name for easy identification
              </p>
            </div>

            {/* Special Attribute */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Special Attribute
              </label>
              <select
                value={formData.unlockAttr}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unlockAttr: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                <option value={0}>Normal</option>
                <option value={1}>Duress/Special</option>
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Set to &quot;Duress&quot; to trigger silent alarm when used
              </p>
            </div>

            {/* Notification Settings */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifyApp}
                  onChange={(e) =>
                    setFormData({ ...formData, notifyApp: e.target.checked })
                  }
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <span className="text-xs text-neutral-700">
                  Send app notifications when used
                </span>
              </label>
            </div>

            {/* Info Banner */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                ℹ️ Changes will be synced to the device. Make sure the lock is
                online and connected.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-neutral-900 hover:bg-neutral-800"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
