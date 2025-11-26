/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/unlock-methods/EditUnlockMethodModal.tsx

"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
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
    unlockAttr: method.unlock_attr?.toString() || "0",
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

      if (formData.unlockName !== method.unlock_name) {
        requestData.unlockName = formData.unlockName;
      }
      if (method.dp_code) {
        requestData.dpCode = method.dp_code;
      }
      if (parseInt(formData.unlockAttr) !== method.unlock_attr) {
        requestData.unlockAttr = parseInt(formData.unlockAttr);
      }
      requestData.notifyInfo = {
        app_send: formData.notifyApp,
      };

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
        onSuccess?.();
      } else {
        setError(data.error || "Failed to update unlock method");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const methodType = method.unlock_type || method.dp_code;

  return (
    <Dialog open={true} onOpenChange={() => onCancel?.()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Unlock Method</DialogTitle>
          <DialogDescription>
            Update method settings and configuration
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">
                {getMethodTypeName(methodType)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Slot Number:</span>
              <span className="font-mono font-medium">
                #{method.unlock_no || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Serial Number:</span>
              <span className="font-mono font-medium">{method.unlock_sn}</span>
            </div>
            {method.user_name && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Assigned to:</span>
                <span className="font-medium">{method.user_name}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unlockName">Method Name</Label>
            <Input
              id="unlockName"
              value={formData.unlockName}
              onChange={(e) =>
                setFormData({ ...formData, unlockName: e.target.value })
              }
              placeholder={`${getMethodTypeName(methodType)} ${
                method.unlock_no || ""
              }`}
            />
            <p className="text-xs text-muted-foreground">
              Give this unlock method a custom name for easy identification
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unlockAttr">Special Attribute</Label>
            <Select
              value={formData.unlockAttr}
              onValueChange={(value) =>
                setFormData({ ...formData, unlockAttr: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Normal</SelectItem>
                <SelectItem value="1">Duress/Special</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Set to &quot;Duress&quot; to trigger silent alarm when used
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifyApp"
              checked={formData.notifyApp}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, notifyApp: checked as boolean })
              }
            />
            <Label htmlFor="notifyApp" className="text-sm font-normal">
              Send app notifications when used
            </Label>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              Changes will be synced to the device. Make sure the lock is online
              and connected.
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
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
