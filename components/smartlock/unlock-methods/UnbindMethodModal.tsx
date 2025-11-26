/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/unlock-methods/UnbindMethodModal.tsx

"use client";

import { useState } from "react";
import { UserMinus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
        onSuccess?.();
      } else {
        setError(data.error || "Failed to unbind unlock method");
      }
    } catch (error: any) {
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
    <Dialog open={true} onOpenChange={() => onCancel?.()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Unbind Unlock Method</DialogTitle>
          <DialogDescription>
            Remove this method from the user&apos;s assigned methods
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This will remove the unlock method from{" "}
              <strong>{userName}</strong>. The method will become available for
              assignment to other users.
            </AlertDescription>
          </Alert>

          <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Method:</span>
              <span className="font-medium">
                {method.unlock_name || getMethodTypeName(method.dp_code)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">
                {getMethodTypeName(method.dp_code)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Serial Number:</span>
              <span className="font-mono font-medium">{method.unlock_sn}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">User:</span>
              <span className="font-medium">{userName}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onCancel} variant="outline" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUnbind}
            disabled={loading}
            variant="destructive"
          >
            <UserMinus className="mr-2 h-4 w-4" />
            {loading ? "Unbinding..." : "Unbind Method"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
