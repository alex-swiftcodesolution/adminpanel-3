/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/door-control/RemoteMethodsConfig.tsx

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RemoteUnlockMethod } from "@/lib/tuya/tuya-api-wrapper";
import {
  Settings,
  RefreshCw,
  WifiOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface RemoteMethodsConfigProps {
  deviceId: string;
}

const METHOD_LABELS: Record<string, string> = {
  remoteUnlockWithoutPwd: "Remote Unlock (No Password)",
  remoteUnlockWithPwd: "Remote Unlock (With Password)",
};

const METHOD_DESCRIPTIONS: Record<string, string> = {
  remoteUnlockWithoutPwd:
    "One-click remote unlock without password verification",
  remoteUnlockWithPwd: "Requires password confirmation before unlocking",
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export default function RemoteMethodsConfig({
  deviceId,
}: RemoteMethodsConfigProps) {
  const [methods, setMethods] = useState<RemoteUnlockMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    fetchMethods();
    fetchDeviceStatus();
  }, [deviceId]);

  const fetchDeviceStatus = async () => {
    try {
      const response = await fetch(
        `/api/smartlock/device/info?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setIsOnline(data.data.online || false);
      }
    } catch (err) {
      console.error("Error fetching device status:", err);
    }
  };

  const fetchMethods = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/smartlock/door-control/remote-methods?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.success) {
        setMethods(data.data);
      } else {
        setError(data.error || "Failed to fetch remote methods");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (
    remoteUnlockType: string,
    currentState: boolean
  ) => {
    try {
      setUpdating(remoteUnlockType);
      setError(null);
      setSuccess(null);

      const newState = !currentState;

      const response = await fetch(
        "/api/smartlock/door-control/remote-methods",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            remote_unlock_type: remoteUnlockType,
            open: newState,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const action = newState ? "enabled" : "disabled";
        const methodName = METHOD_LABELS[remoteUnlockType] || remoteUnlockType;

        if (!isOnline) {
          setSuccess(
            `${methodName} will be ${action} when device comes online`
          );
        } else {
          setSuccess(`${methodName} ${action} successfully`);
        }

        setTimeout(() => setSuccess(null), 3000);
        await fetchMethods();
      } else {
        setError(data.error || "Failed to update setting");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <CardTitle className="text-lg">Remote Unlock Methods</CardTitle>
          </div>
          <Button
            onClick={() => {
              fetchMethods();
              fetchDeviceStatus();
            }}
            disabled={loading}
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Offline Warning */}
        {!isOnline && (
          <Alert className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Device is offline. Changes will apply when device reconnects.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {success && (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{success}</AlertDescription>
          </Alert>
        )}

        {/* Methods List */}
        {methods.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No remote unlock methods available
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This device may not support remote unlocking
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map((method, index) => (
              <motion.div
                key={method.remote_unlock_type || index}
                variants={item}
                initial="hidden"
                animate="show"
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${
                    !isOnline ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <Label className="text-sm font-medium">
                      {METHOD_LABELS[method.remote_unlock_type] ||
                        method.remote_unlock_type}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {METHOD_DESCRIPTIONS[method.remote_unlock_type] ||
                        `Type: ${method.remote_unlock_type}`}
                    </p>
                    <p className="text-xs">
                      Status:{" "}
                      <span
                        className={`font-medium ${
                          method.open
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {method.open ? "Enabled" : "Disabled"}
                      </span>
                    </p>
                  </div>

                  <Switch
                    checked={method.open}
                    onCheckedChange={() =>
                      handleToggle(method.remote_unlock_type, method.open)
                    }
                    disabled={updating === method.remote_unlock_type}
                    className="ml-4"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Separator className="my-4" />

        {/* Info Box */}
        <Alert>
          <AlertTitle className="text-sm">
            About Remote Unlock Methods
          </AlertTitle>
          <AlertDescription className="text-xs space-y-1 mt-2">
            <p>
              <strong>With Password:</strong> More secure, requires password
              verification
            </p>
            <p>
              <strong>Without Password:</strong> Convenient one-click unlock
            </p>
            <p>• Enable only the methods you need for security</p>
            <p>• Changes require device to be online to take effect</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
