/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/unlock-methods/MethodSettingsModal.tsx

"use client";

import { useState } from "react";
import { Settings, Camera, Mic, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

      if (settings.photoCapture !== (method.photo_unlock === 2)) {
        await fetch(
          `/api/smartlock/unlock-methods/${method.unlock_sn}/attributes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceId,
              attribute: 2,
              enabled: settings.photoCapture,
            }),
          }
        );
      }

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
        onSuccess?.();
      } else {
        setError(data.error || "Failed to update settings");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel?.()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Method Settings</DialogTitle>
          <DialogDescription>
            Configure security settings for {method.unlock_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">{method.unlock_name}</p>
            <p className="text-xs text-muted-foreground">
              SN: {method.unlock_sn}
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <div className="p-2 bg-muted rounded-lg">
              <Camera className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="photoCapture" className="text-sm font-medium">
                    Photo Capture
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Capture photo when this method is used
                  </p>
                </div>
                <Switch
                  id="photoCapture"
                  checked={settings.photoCapture}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, photoCapture: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg opacity-50">
            <div className="p-2 bg-muted rounded-lg">
              <Mic className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Voice Control</Label>
                  <p className="text-xs text-muted-foreground">
                    Voice control settings (read-only)
                  </p>
                </div>
                <Switch checked={settings.voiceControl} disabled />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <div className="p-2 bg-muted rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="duressAlarm" className="text-sm font-medium">
                    Duress Alarm
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Trigger silent alarm when used
                  </p>
                </div>
                <Switch
                  id="duressAlarm"
                  checked={settings.duressAlarm}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, duressAlarm: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onCancel} variant="outline" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Settings className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
