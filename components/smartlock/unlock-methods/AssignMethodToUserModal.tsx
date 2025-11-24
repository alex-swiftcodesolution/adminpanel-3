/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/unlock-methods/AssignMethodToUserModal.tsx

"use client";

import { useState, useEffect } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AssignMethodToUserModalProps {
  deviceId: string;
  userId: string;
  userName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AssignMethodToUserModal({
  deviceId,
  userId,
  userName,
  onSuccess,
  onCancel,
}: AssignMethodToUserModalProps) {
  const [availableMethods, setAvailableMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAvailableMethods = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/smartlock/unlock-methods?deviceId=${deviceId}`
        );
        const data = await response.json();

        if (data.success) {
          setAvailableMethods(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching methods:", error);
        setError("Failed to load available methods");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableMethods();
  }, [deviceId]);

  const handleAssign = async (method: any) => {
    try {
      setAssigning(true);
      setError("");

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
        userId,
        method,
        dpCode,
      });

      const response = await fetch("/api/smartlock/unlock-methods/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          userId,
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
        onSuccess();
      } else {
        setError(data.error || "Failed to assign method");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setAssigning(false);
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
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">
                Assign Unlock Method
              </CardTitle>
              <p className="text-sm text-neutral-500 mt-1">
                Assigning to: <strong>{userName}</strong>
              </p>
            </div>
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

          {loading ? (
            <div className="py-12 text-center flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
              <p className="text-sm text-neutral-500">
                Loading available methods...
              </p>
            </div>
          ) : availableMethods.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-700">
                No unassigned methods available
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Enroll new methods on the lock device first
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableMethods.map((method, index) => (
                <div
                  key={`${method.unlock_no}-${index}`}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors"
                >
                  <div>
                    <p className="font-medium text-neutral-900">
                      {getMethodTypeName(method.unlock_type)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Slot #{method.unlock_no}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleAssign(method)}
                    disabled={assigning}
                    size="sm"
                    className="bg-neutral-900 hover:bg-neutral-800"
                  >
                    {assigning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
