/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/door-control/DoorControlPanel.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
  Battery,
  Clock,
  AlertTriangle,
  Key,
  Shield,
  Settings,
  CheckCircle,
  XCircle,
  Zap,
  Activity,
} from "lucide-react";
import {
  extractDeviceStatus,
  DeviceLockStatus,
} from "@/lib/utils/device-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RemoteUnlockMethod } from "@/lib/tuya/tuya-api-wrapper";

interface DoorControlPanelProps {
  deviceId: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const METHOD_LABELS: Record<string, string> = {
  remoteUnlockWithoutPwd: "Quick Unlock",
  remoteUnlockWithPwd: "Password Unlock",
};

const METHOD_DESCRIPTIONS: Record<string, string> = {
  remoteUnlockWithoutPwd: "One-tap unlock",
  remoteUnlockWithPwd: "Requires password",
};

export default function DoorControlPanel({ deviceId }: DoorControlPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<DeviceLockStatus>({
    lockState: "unknown",
    online: false,
    reportedOnline: false,
    battery: null,
    lastUpdate: null,
    isStale: true,
    timeAgo: "Unknown",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [remoteMethods, setRemoteMethods] = useState<RemoteUnlockMethod[]>([]);
  const [updatingMethod, setUpdatingMethod] = useState<string | null>(null);

  useEffect(() => {
    fetchDeviceStatus();
    fetchRemoteMethods();
  }, [deviceId]);

  const fetchDeviceStatus = async () => {
    try {
      setFetchingStatus(true);
      const response = await fetch(
        `/api/smartlock/device/info?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        const status = extractDeviceStatus(data.data);
        setDeviceStatus(status);
      }
    } catch (error) {
      console.error("Error fetching device status:", error);
    } finally {
      setFetchingStatus(false);
    }
  };

  const fetchRemoteMethods = async () => {
    try {
      const response = await fetch(
        `/api/smartlock/door-control/remote-methods?deviceId=${deviceId}`
      );
      const data = await response.json();
      if (data.success) {
        setRemoteMethods(data.data);
      }
    } catch (error) {
      console.error("Error fetching remote methods:", error);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUnlock = async (withPassword: boolean = false) => {
    try {
      setLoading("unlock");
      setMessage(null);

      const body: any = { deviceId };
      if (withPassword && password) {
        body.password = password;
      }

      const response = await fetch("/api/smartlock/door-control/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setDeviceStatus((prev) => ({ ...prev, lockState: "unlocked" }));
        showMessage("success", "Unlock command sent successfully!");
        setPassword("");
        setTimeout(fetchDeviceStatus, 2000);
      } else {
        showMessage("error", data.error || "Failed to unlock door");
      }
    } catch (error: any) {
      showMessage("error", error.message || "Failed to unlock door");
    } finally {
      setLoading(null);
    }
  };

  const handleLock = async () => {
    try {
      setLoading("lock");
      setMessage(null);

      const response = await fetch("/api/smartlock/door-control/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();

      if (data.success) {
        setDeviceStatus((prev) => ({ ...prev, lockState: "locked" }));
        showMessage("success", "Lock command sent successfully!");
        setTimeout(fetchDeviceStatus, 2000);
      } else {
        showMessage("error", data.error || "Failed to lock door");
      }
    } catch (error: any) {
      showMessage("error", error.message || "Failed to lock door");
    } finally {
      setLoading(null);
    }
  };

  const handleRevoke = async (type: 1 | 2 = 1) => {
    try {
      setLoading("revoke");
      setMessage(null);

      const response = await fetch("/api/smartlock/door-control/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, type }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", "Request revoked successfully!");
      } else {
        showMessage("error", data.error || "Failed to revoke");
      }
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setLoading(null);
    }
  };

  const handleToggleMethod = async (
    remoteUnlockType: string,
    currentState: boolean
  ) => {
    try {
      setUpdatingMethod(remoteUnlockType);
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
        showMessage("success", `${methodName} ${action}`);
        await fetchRemoteMethods();
      } else {
        showMessage("error", data.error || "Failed to update");
      }
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setUpdatingMethod(null);
    }
  };

  const { lockState, online, battery, isStale, timeAgo } = deviceStatus;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Message Display */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Status & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Live Status */}
          <motion.div variants={item}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Live Status</CardTitle>
                  <Button
                    onClick={fetchDeviceStatus}
                    disabled={fetchingStatus}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        fetchingStatus ? "animate-spin" : ""
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center py-6">
                  <motion.div
                    animate={{
                      scale: fetchingStatus ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      repeat: fetchingStatus ? Infinity : 0,
                      duration: 1.5,
                    }}
                    className={`relative inline-flex items-center justify-center w-24 h-24 rounded-full ${
                      lockState === "locked"
                        ? "bg-destructive/10"
                        : lockState === "unlocked"
                        ? "bg-green-500/10"
                        : "bg-muted"
                    }`}
                  >
                    {fetchingStatus ? (
                      <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
                    ) : lockState === "locked" ? (
                      <Lock className="w-10 h-10 text-destructive" />
                    ) : lockState === "unlocked" ? (
                      <Unlock className="w-10 h-10 text-green-600 dark:text-green-400" />
                    ) : (
                      <ShieldAlert className="w-10 h-10 text-muted-foreground" />
                    )}
                    <div className="absolute -bottom-1 -right-1">
                      <Badge
                        variant={online ? "default" : "destructive"}
                        className="h-6 w-6 rounded-full p-0 flex items-center justify-center"
                      >
                        {online ? (
                          <Wifi className="h-3 w-3" />
                        ) : (
                          <WifiOff className="h-3 w-3" />
                        )}
                      </Badge>
                    </div>
                  </motion.div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold">
                    {lockState === "locked"
                      ? "Locked"
                      : lockState === "unlocked"
                      ? "Unlocked"
                      : "Unknown"}
                  </h3>
                  <p className="text-xs text-muted-foreground">{timeAgo}</p>
                  {isStale && (
                    <Badge variant="outline" className="text-xs">
                      Stale Data
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Connection</span>
                    <Badge variant={online ? "default" : "secondary"}>
                      {online ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  {battery !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Battery</span>
                      <div className="flex items-center gap-2">
                        <Battery
                          className={`h-4 w-4 ${
                            battery > 50
                              ? "text-green-600 dark:text-green-400"
                              : battery > 20
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-destructive"
                          }`}
                        />
                        <span className="font-medium">{battery}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Offline Warning */}
          {!online && (
            <motion.div variants={item}>
              <Alert>
                <WifiOff className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {isStale
                    ? `Last seen ${timeAgo}. Commands will queue until reconnection.`
                    : "Device offline. Commands may not execute."}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Remote Methods */}
          <motion.div variants={item}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <CardTitle className="text-base">Remote Methods</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {remoteMethods.length === 0 ? (
                  <div className="text-center py-6">
                    <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No methods available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {remoteMethods.map((method) => (
                      <div
                        key={method.remote_unlock_type}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {METHOD_LABELS[method.remote_unlock_type] ||
                              method.remote_unlock_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {METHOD_DESCRIPTIONS[method.remote_unlock_type]}
                          </p>
                        </div>
                        <Switch
                          checked={method.open}
                          onCheckedChange={() =>
                            handleToggleMethod(
                              method.remote_unlock_type,
                              method.open
                            )
                          }
                          disabled={
                            updatingMethod === method.remote_unlock_type
                          }
                          className="ml-3"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => handleUnlock(false)}
                      disabled={!!loading}
                      className="w-full h-24 flex-col gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                    >
                      {loading === "unlock" ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <Unlock className="h-8 w-8" />
                      )}
                      <span className="text-sm font-medium">
                        {loading === "unlock" ? "Unlocking..." : "Unlock"}
                      </span>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleLock}
                      disabled={!!loading}
                      variant="destructive"
                      className="w-full h-24 flex-col gap-2"
                    >
                      {loading === "lock" ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <Lock className="h-8 w-8" />
                      )}
                      <span className="text-sm font-medium">
                        {loading === "lock" ? "Locking..." : "Lock"}
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Password Unlock */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  <CardTitle className="text-lg">Password Unlock</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">
                    6-Digit Password
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      maxLength={6}
                      placeholder="••••••"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleUnlock(true)}
                      disabled={!!loading || !password || password.length !== 6}
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      Unlock
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Controls */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle className="text-lg">Advanced Controls</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleRevoke(1)}
                    disabled={!!loading}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    {loading === "revoke" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Reject Request
                  </Button>

                  <Button
                    onClick={() => handleRevoke(2)}
                    disabled={!!loading}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Request
                  </Button>
                </div>

                <Separator className="my-4" />

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Remote operations require internet connection. Always verify
                    door status after commands.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
