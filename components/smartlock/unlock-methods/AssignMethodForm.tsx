/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/unlock-methods/AssignMethodForm.tsx

"use client";

import { useState, useEffect } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UnlockKey } from "@/lib/tuya/tuya-api-wrapper";

interface DeviceUser {
  user_id: string;
  nick_name: string;
}

interface AssignMethodFormProps {
  deviceId: string;
  method: UnlockKey;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AssignMethodForm({
  deviceId,
  method,
  onSuccess,
  onCancel,
}: AssignMethodFormProps) {
  const [users, setUsers] = useState<DeviceUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch(
          `/api/smartlock/users?deviceId=${deviceId}&type=device`
        );
        const data = await response.json();

        if (data.success) {
          setUsers(data.data || []);
          console.log("👥 Loaded users:", data.data.length);
        }
      } catch (error) {
        console.error("❌ Error fetching users:", error);
        setError("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [deviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Convert unlock_type to dp_code format
      const dpCodeMap: Record<string, string> = {
        password: "unlock_password",
        fingerprint: "unlock_fingerprint",
        card: "unlock_card",
        face: "unlock_face",
        hand: "unlock_hand",
        finger_vein: "unlock_finger_vein",
        eye: "unlock_eye",
        remoteControl: "unlock_telecontrol_kit",
      };

      const dpCode =
        dpCodeMap[method.unlock_type] || `unlock_${method.unlock_type}`;

      console.log("🔗 Assigning method:", {
        deviceId,
        userId: selectedUserId,
        unlockList: [{ dp_code: dpCode, unlock_sn: method.unlock_no }],
      });

      const response = await fetch("/api/smartlock/unlock-methods/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          userId: selectedUserId,
          unlockList: [
            {
              dp_code: dpCode,
              unlock_sn: method.unlock_no,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Method assigned successfully");
        onSuccess?.();
      } else {
        setError(data.error || "Failed to assign unlock method");
      }
    } catch (error: any) {
      console.error("❌ Error assigning method:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getMethodTypeName = (type: string) => {
    const nameMap: Record<string, string> = {
      password: "Password",
      fingerprint: "Fingerprint",
      card: "Card/Fob",
      remoteControl: "Remote Control",
      face: "Face Recognition",
      hand: "Palm Print",
      finger_vein: "Finger Vein",
      eye: "Iris Recognition",
      key: "Physical Key",
    };
    return (
      nameMap[type.toLowerCase()] ||
      type.charAt(0).toUpperCase() + type.slice(1)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Assign Unlock Method to User
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
                  {getMethodTypeName(method.unlock_type)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Slot Number:</span>
                <span className="font-mono font-medium text-neutral-900">
                  #{method.unlock_no}
                </span>
              </div>
            </div>

            {/* User Selection */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Assign to User <span className="text-red-500">*</span>
              </label>
              {loadingUsers ? (
                <div className="flex items-center gap-2 p-3 border border-neutral-300 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                  <span className="text-sm text-neutral-500">
                    Loading users...
                  </span>
                </div>
              ) : users.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    No users found. Please create a user first.
                  </p>
                </div>
              ) : (
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  required
                >
                  <option value="">-- Select a user --</option>
                  {users.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.nick_name} (ID: {user.user_id})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Info Banner */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                ℹ️ This will assign the unlock method to the selected user. Make
                sure the method was already enrolled on the physical device.
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
                disabled={loading || loadingUsers || users.length === 0}
                className="flex-1 bg-neutral-900 hover:bg-neutral-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Method
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
