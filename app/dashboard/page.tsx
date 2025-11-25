/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Server,
  Activity,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// shadcn components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface TuyaDevice {
  id: string;
  name: string;
  category: string;
  online: boolean;
  product_name?: string;
  icon?: string;
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

export default function DeviceSelectionPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<TuyaDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/smartlock/devices/list");
      const data = await response.json();

      if (data.success) {
        // Filter for smart locks (you can adjust categories as needed)
        const locks = data.data.filter(
          (device: TuyaDevice) =>
            device.category === "ms" || // Smart lock
            device.category === "jtmspro" || // Smart lock pro
            device.category === "mk" || // Access control
            device.name?.toLowerCase().includes("lock") ||
            device.name?.toLowerCase().includes("door")
        );

        setDevices(locks.length > 0 ? locks : data.data); // If no locks found, show all devices
      } else {
        setError(data.error || "Failed to fetch devices");
      }
    } catch (error: any) {
      console.error("Error fetching devices:", error);
      setError(error.message || "Failed to connect to Tuya API");
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceClick = (id: string) => {
    router.push(`/dashboard/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3 md:gap-4">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-foreground rounded-lg"
              >
                <Lock className="w-5 h-5 md:w-6 md:h-6 text-background" />
              </motion.div>
              <div>
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                  Device Manager
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  Smart Lock Administration
                </p>
              </div>
            </div>

            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={fetchDevices}
                disabled={loading}
                variant="outline"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10"
              >
                <RefreshCw
                  className={`w-4 h-4 md:w-5 md:h-5 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
        >
          <Card className="border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">
                    Total Devices
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
                    {devices.length}
                  </p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-muted flex items-center justify-center">
                  <LayoutGrid className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">
                    Online
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
                    {devices.filter((d) => d.online).length}
                  </p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 md:h-6 md:w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">
                    Offline
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
                    {devices.filter((d) => !d.online).length}
                  </p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Server className="h-5 w-5 md:h-6 md:w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-foreground mt-1">
                    {loading ? "..." : error ? "Error" : "Active"}
                  </p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-muted flex items-center justify-center">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      loading
                        ? "bg-yellow-500 animate-pulse"
                        : error
                        ? "bg-red-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Devices Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                Connected Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {/* Loading State */}
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 md:py-24"
                  >
                    <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-foreground animate-spin mb-4" />
                    <p className="text-sm md:text-base text-muted-foreground">
                      Loading devices...
                    </p>
                  </motion.div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Connection Error</AlertTitle>
                      <AlertDescription className="text-sm">
                        {error}
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={fetchDevices}
                      variant="outline"
                      className="w-full sm:w-auto mb-4"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry Connection
                    </Button>

                    {/* Help Text */}
                    <Card className="bg-muted/50 border-muted">
                      <CardContent className="pt-6">
                        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Troubleshooting Steps
                        </p>
                        <ul className="text-xs md:text-sm text-muted-foreground space-y-2 list-disc list-inside">
                          <li>
                            Verify TUYA_APP_ACCOUNT_UID in environment variables
                          </li>
                          <li>Check API credentials have proper permissions</li>
                          <li>
                            Ensure devices are linked to your Tuya account
                          </li>
                          <li>Verify network connectivity to Tuya servers</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Empty State */}
                {!loading && !error && devices.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-16 md:py-24"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-muted rounded-full mb-4">
                      <Lock className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                    </div>
                    <p className="text-base md:text-lg font-semibold mb-2">
                      No Devices Found
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      No smart lock devices are currently registered to your
                      account. Add devices through the Tuya Smart app.
                    </p>
                  </motion.div>
                )}

                {/* Devices Grid */}
                {!loading && devices.length > 0 && (
                  <motion.div
                    key="devices"
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
                  >
                    {devices.map((device, index) => (
                      <motion.div
                        key={device.id}
                        variants={item}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card
                          className="border-border hover:border-foreground/20 transition-all cursor-pointer group h-full"
                          onClick={() => handleDeviceClick(device.id)}
                        >
                          <CardContent className="p-4 md:p-6">
                            <div className="flex flex-col h-full">
                              {/* Icon and Status */}
                              <div className="flex items-start justify-between mb-4">
                                <motion.div
                                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                  transition={{ duration: 0.5 }}
                                  className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-muted group-hover:bg-foreground group-hover:text-background transition-all flex items-center justify-center"
                                >
                                  <Lock className="h-6 w-6 md:h-7 md:w-7" />
                                </motion.div>
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <div
                                    className={`h-2 w-2 rounded-full ${
                                      device.online
                                        ? "bg-emerald-500"
                                        : "bg-red-500"
                                    }`}
                                  />
                                </motion.div>
                              </div>

                              {/* Device Info */}
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm md:text-base text-foreground mb-1 line-clamp-1">
                                  {device.name}
                                </h3>
                                <p className="text-xs text-muted-foreground font-mono mb-3 truncate">
                                  {device.id}
                                </p>
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between pt-3 border-t border-border">
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-mono"
                                >
                                  {device.category}
                                </Badge>
                                <span
                                  className={`text-xs font-medium ${
                                    device.online
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {device.online ? "Online" : "Offline"}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-border mt-auto py-6"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs md:text-sm text-center text-muted-foreground">
            Smart Lock Management System
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
