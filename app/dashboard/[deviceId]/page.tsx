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
  Clock,
  CreditCard,
  Smartphone,
  Eye,
  KeyRound,
  Bell,
  ShieldAlert,
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

interface ActivityItem {
  type: "unlock" | "alarm";
  time: number;
  user_name?: string;
  nick_name?: string;
  unlock_name?: string;
  unlock_code?: string;
  alarm_code?: string;
  alarm_message?: string;
  severity?: "high" | "medium" | "low";
}

// Unlock type mappings
const UNLOCK_TYPE_MAP: Record<
  string,
  { name: string; icon: React.ComponentType<{ className?: string }> }
> = {
  unlock_fingerprint: { name: "Fingerprint", icon: Fingerprint },
  unlock_password: { name: "Password", icon: Key },
  unlock_temporary: { name: "Temp Password", icon: Clock },
  unlock_dynamic: { name: "Dynamic Password", icon: KeyRound },
  unlock_card: { name: "Card", icon: CreditCard },
  unlock_face: { name: "Face Recognition", icon: Eye },
  unlock_key: { name: "Mechanical Key", icon: Key },
  unlock_app: { name: "App Remote", icon: Smartphone },
  unlock_identity_card: { name: "Identity Card", icon: CreditCard },
  unlock_emergency: { name: "Emergency", icon: AlertCircle },
};

// Alarm type mappings
const ALARM_TYPE_MAP: Record<
  string,
  {
    name: string;
    severity: "high" | "medium" | "low";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  hijack: { name: "Duress Alarm", severity: "high", icon: ShieldAlert },
  alarm_lock: { name: "Lock Alarm", severity: "medium", icon: AlertTriangle },
  doorbell: { name: "Doorbell", severity: "low", icon: Bell },
};

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
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

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
          `/api/smartlock/history/unlocks?deviceId=${deviceId}&pageNo=1&pageSize=10`
        ).then((r) => r.json()),
        fetch(
          `/api/smartlock/history/alarms?deviceId=${deviceId}&pageNo=1&pageSize=10&codes=alarm_lock,hijack,doorbell`
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

      // Extract data with proper fallbacks
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
      const device =
        deviceRes.status === "fulfilled" && deviceRes.value?.data
          ? deviceRes.value.data
          : null;

      // Extract unlocks - API returns { data: { logs: [...], total, ... } }
      const unlocksData =
        unlocksRes.status === "fulfilled" && unlocksRes.value?.success
          ? unlocksRes.value.data
          : null;
      const unlocks = unlocksData?.logs || [];
      const totalUnlocks = unlocksData?.total || 0;

      // Extract alarms - API returns { data: { records: [...], total, ... } }
      const alarmsData =
        alarmsRes.status === "fulfilled" && alarmsRes.value?.success
          ? alarmsRes.value.data
          : null;
      const alarms = alarmsData?.records || [];
      const totalAlarms = alarmsData?.total || 0;

      // Debug logging
      console.log("Unlocks response:", unlocksRes);
      console.log("Unlocks data:", unlocksData);
      console.log("Unlocks array:", unlocks);
      console.log("Alarms response:", alarmsRes);
      console.log("Alarms data:", alarmsData);
      console.log("Alarms array:", alarms);

      const batteryStatus = device?.status?.find(
        (s: any) => s.code === "residual_electricity"
      );
      const batteryLevel = batteryStatus?.value || 0;

      const newStats = {
        passwords: Array.isArray(passwords) ? passwords.length : 0,
        users: Array.isArray(users) ? users.length : 0,
        unlockMethods: Array.isArray(methods) ? methods.length : 0,
        recentUnlocks: totalUnlocks,
        recentAlarms: totalAlarms,
        deviceOnline: device?.online || false,
        batteryLevel: batteryLevel,
        deviceName: device?.name || device?.product_name || "Smart Lock",
      };

      setStats(newStats);

      // Build activity list
      const activity: ActivityItem[] = [];

      // Process unlock records - matching UnlockHistoryList structure
      if (Array.isArray(unlocks) && unlocks.length > 0) {
        unlocks.forEach((record: any) => {
          // Get unlock time - handle different timestamp formats
          let time = 0;
          if (record.update_time) {
            // If timestamp is in milliseconds (> 10 digits), convert to seconds
            time =
              record.update_time > 9999999999
                ? Math.floor(record.update_time / 1000)
                : record.update_time;
          }

          activity.push({
            type: "unlock",
            time: time,
            user_name: record.nick_name || record.user_name || "Unknown User",
            unlock_name: record.unlock_name || "Unknown Method",
            unlock_code: record.status?.code || "unlock_app",
          });
        });
      }

      // Process alarm records - matching AlarmHistoryList structure
      if (Array.isArray(alarms) && alarms.length > 0) {
        alarms.forEach((record: any) => {
          // Get alarm time - handle different timestamp formats
          let time = 0;
          if (record.update_time) {
            time =
              record.update_time > 9999999999
                ? Math.floor(record.update_time / 1000)
                : record.update_time;
          }

          // Handle status which can be array or object
          const statusItem = Array.isArray(record.status)
            ? record.status[0]
            : record.status;

          const alarmCode = statusItem?.code || "doorbell";
          const alarmInfo = ALARM_TYPE_MAP[alarmCode] || {
            name: "Alert",
            severity: "medium" as const,
          };

          activity.push({
            type: "alarm",
            time: time,
            nick_name: record.nick_name || "System",
            alarm_code: alarmCode,
            alarm_message: statusItem?.value || "Alert triggered",
            severity: alarmInfo.severity,
          });
        });
      }

      // Sort by time (newest first)
      activity.sort((a, b) => (b.time || 0) - (a.time || 0));
      setRecentActivity(activity.slice(0, 5));
    } catch (error: any) {
      console.error("Dashboard fetch error:", error);
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

  const getUnlockInfo = (code: string) => {
    return UNLOCK_TYPE_MAP[code] || { name: "Unknown", icon: DoorOpen };
  };

  const getAlarmInfo = (code: string) => {
    return (
      ALARM_TYPE_MAP[code] || {
        name: "Alert",
        severity: "medium" as const,
        icon: AlertTriangle,
      }
    );
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          border: "border-destructive/30",
          bg: "bg-destructive/5",
          iconBg: "bg-destructive/10 text-destructive",
          badge: "destructive" as const,
        };
      case "medium":
        return {
          border: "border-orange-500/30",
          bg: "bg-orange-500/5",
          iconBg:
            "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
          badge: "default" as const,
        };
      case "low":
        return {
          border: "border-muted",
          bg: "bg-muted/30",
          iconBg: "bg-muted text-muted-foreground",
          badge: "secondary" as const,
        };
      default:
        return {
          border: "border-muted",
          bg: "",
          iconBg: "bg-muted text-muted-foreground",
          badge: "outline" as const,
        };
    }
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
              {loading ? <Skeleton className="h-8 w-48" /> : stats.deviceName}
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
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full mb-3" />
                  ))}
                </CardContent>
              </Card>
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
              ].map((stat) => (
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
                      <div>
                        <CardTitle className="text-lg">
                          Recent Activity
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {recentActivity.length} events loaded
                        </p>
                      </div>
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
                        <p className="text-xs text-muted-foreground mt-1">
                          Unlock and alarm events will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentActivity.map((activity, idx) => {
                          const isUnlock = activity.type === "unlock";
                          const unlockInfo = isUnlock
                            ? getUnlockInfo(
                                activity.unlock_code || "unlock_app"
                              )
                            : null;
                          const alarmInfo = !isUnlock
                            ? getAlarmInfo(activity.alarm_code || "doorbell")
                            : null;
                          const severityStyles = !isUnlock
                            ? getSeverityStyles(
                                activity.severity ||
                                  alarmInfo?.severity ||
                                  "medium"
                              )
                            : null;

                          const IconComponent = isUnlock
                            ? unlockInfo?.icon || DoorOpen
                            : alarmInfo?.icon || AlertTriangle;

                          return (
                            <motion.div
                              key={`${activity.type}-${activity.time}-${idx}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`p-4 rounded-lg border transition-all hover:border-foreground/20 ${
                                isUnlock
                                  ? "border-primary/20 bg-primary/5"
                                  : `${severityStyles?.border} ${severityStyles?.bg}`
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div
                                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                                    isUnlock
                                      ? "bg-primary/10 text-primary"
                                      : severityStyles?.iconBg
                                  }`}
                                >
                                  <IconComponent className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-2">
                                  {/* Header with badges */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-sm font-semibold">
                                      {isUnlock
                                        ? activity.unlock_name ||
                                          unlockInfo?.name
                                        : alarmInfo?.name}
                                    </h3>
                                    <Badge
                                      variant={
                                        isUnlock
                                          ? "secondary"
                                          : severityStyles?.badge
                                      }
                                      className="text-xs"
                                    >
                                      {isUnlock ? "Unlock" : "Alert"}
                                    </Badge>
                                    {!isUnlock &&
                                      activity.severity === "high" && (
                                        <Badge
                                          variant="destructive"
                                          className="text-xs"
                                        >
                                          HIGH
                                        </Badge>
                                      )}
                                  </div>

                                  {/* Details */}
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {isUnlock
                                        ? activity.user_name
                                        : activity.nick_name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDate(activity.time)}
                                    </span>
                                  </div>
                                </div>

                                {/* Type Badge on right */}
                                <Badge
                                  variant="outline"
                                  className="shrink-0 text-xs hidden sm:flex"
                                >
                                  {isUnlock
                                    ? unlockInfo?.name
                                    : alarmInfo?.name}
                                </Badge>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={item} className="space-y-4">
                <Card className="gap-0">
                  <CardHeader className="pb-2">
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
                <Card className="gap-0">
                  <CardHeader className="pb-3">
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
