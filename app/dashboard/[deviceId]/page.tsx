/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/[deviceId]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import {
  Key,
  Users,
  Fingerprint,
  AlertTriangle,
  Activity,
  DoorOpen,
  ArrowRight,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

      const [
        passwordsRes,
        usersRes,
        methodsRes,
        unlocksRes,
        alarmsRes,
        deviceRes,
      ] = results;

      const passwords =
        passwordsRes.status === "fulfilled" && passwordsRes.value?.data
          ? passwordsRes.value.data
          : [];
      const users =
        usersRes.status === "fulfilled" && usersRes.value?.data
          ? usersRes.value.data
          : [];
      const methods =
        methodsRes.status === "fulfilled" && methodsRes.value?.data
          ? methodsRes.value.data
          : [];
      const unlocks =
        unlocksRes.status === "fulfilled" && unlocksRes.value?.data
          ? unlocksRes.value.data
          : [];
      const alarms =
        alarmsRes.status === "fulfilled" && alarmsRes.value?.data
          ? alarmsRes.value.data
          : [];
      const device =
        deviceRes.status === "fulfilled" && deviceRes.value?.data
          ? deviceRes.value.data
          : null;

      const batteryStatus = device?.status?.find(
        (s: any) => s.code === "residual_electricity"
      );
      const batteryLevel = batteryStatus?.value || 0;

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

      setStats(newStats);

      const activity: any[] = [];

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

      if (Array.isArray(alarms) && alarms.length > 0) {
        alarms.forEach((alarm: any) => {
          activity.push({
            type: "alarm",
            time: Math.floor(alarm.update_time / 1000),
            nick_name: alarm.nick_name || "System",
            alarm_message: "Doorbell pressed",
            status: alarm.status,
          });
        });
      }

      activity.sort((a, b) => (b.time || 0) - (a.time || 0));
      setRecentActivity(activity.slice(0, 10));
    } catch (error: any) {
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

  if (error && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to load dashboard</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={() => fetchDashboardData()}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {stats.deviceName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor and control your smart lock
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="h-8 px-3">
              {getBatteryIcon(stats.batteryLevel)}
              <span className="ml-2 text-xs">{stats.batteryLevel}%</span>
            </Badge>

            <Badge
              variant={stats.deviceOnline ? "default" : "secondary"}
              className="h-8 px-3"
            >
              <Activity
                className={`mr-2 h-3 w-3 ${
                  stats.deviceOnline ? "animate-pulse" : ""
                }`}
              />
              <span className="text-xs">
                {stats.deviceOnline ? "Online" : "Offline"}
              </span>
            </Badge>

            <Button
              onClick={fetchDashboardData}
              disabled={loading}
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
        <Separator />
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 md:space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Temp Passwords",
                  value: stats.passwords,
                  icon: Key,
                  href: `/dashboard/${deviceId}/passwords`,
                },
                {
                  title: "Registered Users",
                  value: stats.users,
                  icon: Users,
                  href: `/dashboard/${deviceId}/users`,
                },
                {
                  title: "Unlock Methods",
                  value: stats.unlockMethods,
                  icon: Fingerprint,
                  href: `/dashboard/${deviceId}/unlock-methods`,
                },
                {
                  title: "Recent Alarms",
                  value: stats.recentAlarms,
                  icon: AlertTriangle,
                  href: `/dashboard/${deviceId}/history`,
                },
              ].map((stat, index) => (
                <motion.div key={stat.title} variants={item}>
                  <Link href={stat.href}>
                    <Card className="hover:border-foreground/20 transition-all cursor-pointer group h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-10 w-10 rounded-lg bg-muted group-hover:bg-foreground transition-colors flex items-center justify-center">
                            <stat.icon className="h-5 w-5 text-muted-foreground group-hover:text-background transition-colors" />
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-2xl md:text-3xl font-bold">
                            {stat.value}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {stat.title}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <motion.div variants={item} className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/${deviceId}/history`}>
                          View All
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Activity className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                          No recent activity
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0 divide-y">
                        {recentActivity.map((activity, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-4 py-4 first:pt-0"
                          >
                            <div
                              className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                                activity.type === "unlock"
                                  ? "bg-muted"
                                  : "bg-foreground"
                              }`}
                            >
                              {activity.type === "unlock" ? (
                                <DoorOpen className="h-5 w-5 text-foreground" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-background" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="text-sm font-medium">
                                {activity.type === "unlock"
                                  ? activity.unlock_name
                                  : activity.alarm_message || "Doorbell"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {activity.type === "unlock"
                                  ? activity.user_name
                                  : activity.nick_name}
                              </p>
                            </div>

                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(activity.time)}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={item} className="space-y-4">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      {
                        title: "Unlock Door",
                        description: "Remote unlock",
                        icon: DoorOpen,
                        href: `/dashboard/${deviceId}/door-control`,
                      },
                      {
                        title: "Create Password",
                        description: "Temporary access",
                        icon: Key,
                        href: `/dashboard/${deviceId}/passwords`,
                      },
                      {
                        title: "Manage Users",
                        description: `${stats.users} registered`,
                        icon: Users,
                        href: `/dashboard/${deviceId}/users`,
                      },
                      {
                        title: "View History",
                        description: "Access logs",
                        icon: Activity,
                        href: `/dashboard/${deviceId}/history`,
                      },
                    ].map((action) => (
                      <Button
                        key={action.title}
                        variant="outline"
                        className="w-full justify-start h-auto py-3 hover:bg-muted"
                        asChild
                      >
                        <Link href={action.href}>
                          <action.icon className="mr-3 h-4 w-4 shrink-0" />
                          <div className="text-left flex-1">
                            <div className="text-sm font-medium">
                              {action.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {action.description}
                            </div>
                          </div>
                        </Link>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* System Info */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">System</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Battery
                      </span>
                      <div className="flex items-center gap-2">
                        {getBatteryIcon(stats.batteryLevel)}
                        <span className="text-sm font-medium">
                          {stats.batteryLevel}%
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge
                        variant={stats.deviceOnline ? "default" : "secondary"}
                      >
                        {stats.deviceOnline ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Device ID
                      </span>
                      <span className="text-sm font-mono">
                        {deviceId.slice(0, 8)}...
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
