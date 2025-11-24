/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/[deviceId]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import {
  Key,
  Users,
  Fingerprint,
  Clock,
  AlertTriangle,
  Activity,
  DoorOpen,
  Wifi,
  WifiOff,
  ArrowRight,
  Battery,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardOverviewProps {
  params: Promise<{ deviceId: string }>;
}

interface DeviceInfo {
  id: string;
  name: string;
  online: boolean;
  status: Array<{ code: string; value: any }>;
  product_name: string;
  category: string;
}

interface TemporaryPassword {
  id: number;
  name: string;
  effective_time: number;
  invalid_time: number;
  sn: number;
  type: number;
  phase: number;
  phone: string;
  time_zone: string;
}

interface User {
  user_id: string;
  nick_name: string;
  device_id: string;
  contact: string;
  sex: number;
}

interface AlarmLog {
  media_infos: any[];
  nick_name: string;
  status: any[];
  update_time: number;
}

interface UnlockLog {
  user_name?: string;
  nick_name?: string;
  unlock_name?: string;
  open_time?: number;
  update_time?: number;
  time?: number;
}

export default function DashboardOverview({ params }: DashboardOverviewProps) {
  const { deviceId } = use(params);

  const [stats, setStats] = useState({
    passwords: 0,
    users: 0,
    unlockMethods: 0,
    recentUnlocks: 0,
    recentAlarms: 0,
    deviceOnline: false,
    batteryLevel: 0,
    deviceName: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    console.log("📱 Dashboard loaded for device:", deviceId);
    if (deviceId && deviceId !== "undefined") {
      fetchDashboardData();
    } else {
      setError("Invalid device ID");
      setLoading(false);
    }
  }, [deviceId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔄 Frontend: Fetching dashboard data...");

      // Fetch all data in parallel
      const results = await Promise.allSettled([
        fetch(`/api/smartlock/passwords/temporary?deviceId=${deviceId}`).then(
          (r) => r.json()
        ),
        fetch(`/api/smartlock/users?deviceId=${deviceId}`).then((r) =>
          r.json()
        ),
        fetch(`/api/smartlock/unlock-methods?deviceId=${deviceId}`).then((r) =>
          r.json()
        ),
        fetch(
          `/api/smartlock/history/unlocks?deviceId=${deviceId}&pageSize=5`
        ).then((r) => r.json()),
        fetch(
          `/api/smartlock/history/alarms?deviceId=${deviceId}&pageSize=5`
        ).then((r) => r.json()),
        fetch(`/api/smartlock/device/info?deviceId=${deviceId}`).then((r) =>
          r.json()
        ),
      ]);

      console.log("📊 Frontend: Raw API Results:", results);

      // Extract the actual data from Promise.allSettled results
      const [
        passwordsRes,
        usersRes,
        methodsRes,
        unlocksRes,
        alarmsRes,
        deviceRes,
      ] = results;

      // ✅ FIX: Extract .data from the response objects
      const passwords =
        passwordsRes.status === "fulfilled" && passwordsRes.value?.data
          ? passwordsRes.value.data
          : [];
      console.log("🔑 Passwords data:", passwords);

      const users =
        usersRes.status === "fulfilled" && usersRes.value?.data
          ? usersRes.value.data
          : [];
      console.log("👥 Users data:", users);

      const methods =
        methodsRes.status === "fulfilled" && methodsRes.value?.data
          ? methodsRes.value.data
          : [];
      console.log("🔓 Methods data:", methods);

      const unlocks =
        unlocksRes.status === "fulfilled" && unlocksRes.value?.data
          ? unlocksRes.value.data
          : [];
      console.log("🚪 Unlocks data:", unlocks);

      const alarms =
        alarmsRes.status === "fulfilled" && alarmsRes.value?.data
          ? alarmsRes.value.data
          : [];
      console.log("🚨 Alarms data:", alarms);

      const device =
        deviceRes.status === "fulfilled" && deviceRes.value?.data
          ? deviceRes.value.data
          : null;
      console.log("📱 Device data:", device);

      // Get battery level from device status
      const batteryStatus = device?.status?.find(
        (s: any) => s.code === "residual_electricity"
      );
      const batteryLevel = batteryStatus?.value || 0;

      console.log("🔋 Battery level:", batteryLevel);

      // Calculate stats
      const newStats = {
        passwords: Array.isArray(passwords) ? passwords.length : 0,
        users: Array.isArray(users) ? users.length : 0,
        unlockMethods: Array.isArray(methods) ? methods.length : 0,
        recentUnlocks: Array.isArray(unlocks) ? unlocks.length : 0,
        recentAlarms: Array.isArray(alarms) ? alarms.length : 0,
        deviceOnline: device?.online || false,
        batteryLevel: batteryLevel,
        deviceName: device?.name || device?.product_name || "Smart Lock",
      };

      console.log("📈 Calculated stats:", newStats);
      setStats(newStats);

      // Combine recent activity
      const activity: any[] = [];

      // Add unlocks - handle both open_time and update_time
      if (Array.isArray(unlocks) && unlocks.length > 0) {
        unlocks.forEach((unlock: any) => {
          activity.push({
            type: "unlock",
            time: unlock.open_time
              ? unlock.open_time
              : unlock.update_time
              ? Math.floor(unlock.update_time / 1000)
              : unlock.time || 0,
            user_name: unlock.nick_name || unlock.user_name || "Unknown",
            unlock_name: unlock.unlock_name || "App Unlock",
          });
        });
      }

      // Add alarms - update_time is in milliseconds
      if (Array.isArray(alarms) && alarms.length > 0) {
        alarms.forEach((alarm: any) => {
          activity.push({
            type: "alarm",
            time: Math.floor(alarm.update_time / 1000), // Convert ms to seconds
            nick_name: alarm.nick_name || "System",
            alarm_message: "Doorbell pressed",
            status: alarm.status,
          });
        });
      }

      // Sort by time (descending)
      activity.sort((a, b) => (b.time || 0) - (a.time || 0));
      const recentActivities = activity.slice(0, 10);

      console.log("📋 Recent activities:", recentActivities);
      setRecentActivity(recentActivities);

      console.log("✅ Frontend: Dashboard data loaded successfully");
    } catch (error: any) {
      console.error("❌ Frontend: Error fetching dashboard data:", error);
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return "Unknown";

    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getBatteryIcon = (level: number) => {
    if (level >= 80) return <BatteryFull className="h-4 w-4" />;
    if (level >= 40) return <BatteryMedium className="h-4 w-4" />;
    return <BatteryLow className="h-4 w-4" />;
  };

  // Error State
  if (error && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
        <Card className="w-full max-w-md border-none shadow-none">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-neutral-400" />
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-neutral-900">
                Unable to load dashboard
              </h2>
              <p className="text-sm text-neutral-500">{error}</p>
              <p className="text-xs font-mono text-neutral-400">{deviceId}</p>
            </div>
            <Button
              onClick={() => fetchDashboardData()}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              {stats.deviceName}
            </h1>
            <p className="text-sm text-neutral-500">
              Monitor and control your smart lock
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="h-8 px-3 font-normal border-neutral-200"
            >
              {getBatteryIcon(stats.batteryLevel)}
              <span className="ml-2 text-xs">{stats.batteryLevel}%</span>
            </Badge>

            <Badge
              variant={stats.deviceOnline ? "default" : "secondary"}
              className={`h-8 px-3 font-normal ${
                stats.deviceOnline
                  ? "bg-neutral-900 hover:bg-neutral-800"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
              }`}
            >
              {stats.deviceOnline ? (
                <Wifi className="mr-2 h-3 w-3" />
              ) : (
                <WifiOff className="mr-2 h-3 w-3" />
              )}
              <span className="text-xs">
                {stats.deviceOnline ? "Online" : "Offline"}
              </span>
            </Badge>
          </div>
        </div>

        <Separator className="bg-neutral-200" />
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-neutral-200">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href={`/dashboard/${deviceId}/passwords`}>
              <Card className="border-neutral-200 hover:border-neutral-400 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
                      <Key className="h-4 w-4 text-neutral-600 group-hover:text-white transition-colors" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-semibold tracking-tight text-neutral-900">
                      {stats.passwords}
                    </h3>
                    <p className="text-xs text-neutral-500">Temp Passwords</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/dashboard/${deviceId}/users`}>
              <Card className="border-neutral-200 hover:border-neutral-400 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
                      <Users className="h-4 w-4 text-neutral-600 group-hover:text-white transition-colors" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-semibold tracking-tight text-neutral-900">
                      {stats.users}
                    </h3>
                    <p className="text-xs text-neutral-500">Registered Users</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/dashboard/${deviceId}/unlock-methods`}>
              <Card className="border-neutral-200 hover:border-neutral-400 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
                      <Fingerprint className="h-4 w-4 text-neutral-600 group-hover:text-white transition-colors" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-semibold tracking-tight text-neutral-900">
                      {stats.unlockMethods}
                    </h3>
                    <p className="text-xs text-neutral-500">Unlock Methods</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/dashboard/${deviceId}/history`}>
              <Card className="border-neutral-200 hover:border-neutral-400 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
                      <AlertTriangle className="h-4 w-4 text-neutral-600 group-hover:text-white transition-colors" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-semibold tracking-tight text-neutral-900">
                      {stats.recentAlarms}
                    </h3>
                    <p className="text-xs text-neutral-500">Recent Alarms</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="border-neutral-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-neutral-900">
                      Recent Activity
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      asChild
                    >
                      <Link href={`/dashboard/${deviceId}/history`}>
                        View All
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Activity className="h-8 w-8 text-neutral-300 mb-3" />
                      <p className="text-sm text-neutral-400">
                        No recent activity
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0 divide-y divide-neutral-100">
                      {recentActivity.map((activity, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                              activity.type === "unlock"
                                ? "bg-neutral-100"
                                : "bg-neutral-900"
                            }`}
                          >
                            {activity.type === "unlock" ? (
                              <DoorOpen className="h-4 w-4 text-neutral-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-white" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            {activity.type === "unlock" ? (
                              <>
                                <p className="text-sm font-medium text-neutral-900">
                                  {activity.unlock_name}
                                </p>
                                {activity.user_name && (
                                  <p className="text-xs text-neutral-500">
                                    {activity.user_name}
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium text-neutral-900">
                                  {activity.alarm_message || "Doorbell"}
                                </p>
                                {activity.nick_name && (
                                  <p className="text-xs text-neutral-500">
                                    {activity.nick_name}
                                  </p>
                                )}
                              </>
                            )}
                          </div>

                          <span className="text-xs text-neutral-400 whitespace-nowrap">
                            {formatDate(activity.time)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card className="border-neutral-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-neutral-900">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 border-neutral-200 hover:bg-neutral-50"
                    asChild
                  >
                    <Link href={`/dashboard/${deviceId}/door-control`}>
                      <DoorOpen className="mr-3 h-4 w-4" />
                      <div className="text-left">
                        <div className="text-sm font-medium">Unlock Door</div>
                        <div className="text-xs text-neutral-500">
                          Remote unlock
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 border-neutral-200 hover:bg-neutral-50"
                    asChild
                  >
                    <Link href={`/dashboard/${deviceId}/passwords`}>
                      <Key className="mr-3 h-4 w-4" />
                      <div className="text-left">
                        <div className="text-sm font-medium">
                          Create Password
                        </div>
                        <div className="text-xs text-neutral-500">
                          Temporary access
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 border-neutral-200 hover:bg-neutral-50"
                    asChild
                  >
                    <Link href={`/dashboard/${deviceId}/users`}>
                      <Users className="mr-3 h-4 w-4" />
                      <div className="text-left">
                        <div className="text-sm font-medium">Manage Users</div>
                        <div className="text-xs text-neutral-500">
                          {stats.users} registered
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 border-neutral-200 hover:bg-neutral-50"
                    asChild
                  >
                    <Link href={`/dashboard/${deviceId}/history`}>
                      <Clock className="mr-3 h-4 w-4" />
                      <div className="text-left">
                        <div className="text-sm font-medium">View History</div>
                        <div className="text-xs text-neutral-500">
                          Access logs
                        </div>
                      </div>
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* System Info */}
              <Card className="border-neutral-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-neutral-900">
                    System
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Battery</span>
                    <div className="flex items-center gap-2">
                      {getBatteryIcon(stats.batteryLevel)}
                      <span className="text-xs font-medium text-neutral-900">
                        {stats.batteryLevel}%
                      </span>
                    </div>
                  </div>
                  <Separator className="bg-neutral-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Status</span>
                    <Badge
                      variant={stats.deviceOnline ? "default" : "secondary"}
                      className={`h-5 px-2 text-xs font-normal ${
                        stats.deviceOnline
                          ? "bg-neutral-900"
                          : "bg-neutral-200 text-neutral-600"
                      }`}
                    >
                      {stats.deviceOnline ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  <Separator className="bg-neutral-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Device ID</span>
                    <span className="text-xs font-mono text-neutral-900">
                      {deviceId.slice(0, 8)}...
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Statistics Footer */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-neutral-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500">Recent Unlocks</p>
                  <p className="text-2xl font-semibold tracking-tight text-neutral-900">
                    {stats.recentUnlocks}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <DoorOpen className="h-4 w-4 text-neutral-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500">Active Alerts</p>
                  <p className="text-2xl font-semibold tracking-tight text-neutral-900">
                    {stats.recentAlarms}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-neutral-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500">Total Users</p>
                  <p className="text-2xl font-semibold tracking-tight text-neutral-900">
                    {stats.users}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-neutral-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
