/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/unlock-methods/AssignMethodForm.tsx

"use client";

import { useState, useEffect } from "react";
import { UserPlus, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        }
      } catch (error) {
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
        onSuccess?.();
      } else {
        setError(data.error || "Failed to assign unlock method");
      }
    } catch (error: any) {
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
    <Dialog open={true} onOpenChange={() => onCancel?.()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Unlock Method to User</DialogTitle>
          <DialogDescription>
            Select a user to assign this unlock method to
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">
                {getMethodTypeName(method.unlock_type)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Slot Number:</span>
              <span className="font-mono font-medium">#{method.unlock_no}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user">
              Assign to User <span className="text-destructive">*</span>
            </Label>
            {loadingUsers ? (
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading users...
                </span>
              </div>
            ) : users.length === 0 ? (
              <Alert>
                <AlertDescription className="text-sm">
                  No users found. Please create a user first.
                </AlertDescription>
              </Alert>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Select a user --" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.nick_name} (ID: {user.user_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This will assign the unlock method to the selected user. Make sure
              the method was already enrolled on the physical device.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingUsers || users.length === 0}
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
