/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/unlock-methods/UnbindMethodModal.tsx

"use client";

import { useState } from "react";
import { UserMinus, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface UnbindMethodModalProps {
  deviceId: string;
  userId: string;
  userName: string;
  method: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UnbindMethodModal({
  deviceId,
  userId,
  userName,
  method,
  onSuccess,
  onCancel,
}: UnbindMethodModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUnbind = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔓 Unbinding method:", {
        deviceId,
        userId,
        method,
      });

      const response = await fetch("/api/smartlock/unlock-methods/unbind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          userId,
          unlockList: [
            {
              code: method.dp_code,
              unlock_sn: method.unlock_sn,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Method unbound successfully");
        onSuccess?.();
      } else {
        setError(data.error || "Failed to unbind unlock method");
      }
    } catch (error: any) {
      console.error("❌ Error unbinding method:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getMethodTypeName = (dpCode: string) => {
    const nameMap: Record<string, string> = {
      unlock_password: "Password",
      unlock_fingerprint: "Fingerprint",
      unlock_card: "Card/Fob",
      unlock_face: "Face Recognition",
      unlock_hand: "Palm Print",
      unlock_finger_vein: "Finger Vein",
      unlock_eye: "Iris Recognition",
      unlock_telecontrol_kit: "Remote Control",
    };
    return nameMap[dpCode] || dpCode;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Unbind Unlock Method
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Warning Banner */}
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900">
                Are you sure you want to unbind this method?
              </p>
              <p className="text-xs text-orange-700 mt-1">
                This will remove the unlock method from{" "}
                <strong>{userName}</strong>. The method will become available
                for assignment to other users.
              </p>
            </div>
          </div>

          {/* Method Details */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2 mb-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Method:</span>
              <span className="font-medium text-neutral-900">
                {method.unlock_name || getMethodTypeName(method.dp_code)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Type:</span>
              <span className="font-medium text-neutral-900">
                {getMethodTypeName(method.dp_code)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Serial Number:</span>
              <span className="font-mono font-medium text-neutral-900">
                {method.unlock_sn}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">User:</span>
              <span className="font-medium text-neutral-900">{userName}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnbind}
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              {loading ? "Unbinding..." : "Unbind Method"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
