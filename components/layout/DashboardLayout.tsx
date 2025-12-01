/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Sidebar from "./Sidebar";
import { ReactNode, useCallback } from "react";
import { useSmartLockEvents } from "@/hooks/useSmartLockEvents";
import EventNotificationDialog from "@/components/smartlock/events/EventNotificationDialog";

interface DashboardLayoutProps {
  children: ReactNode;
  deviceId: string;
}

export default function DashboardLayout({
  children,
  deviceId,
}: DashboardLayoutProps) {
  // Poll for events every 10 seconds
  const { latestEvent, dismissLatest, isPolling } = useSmartLockEvents({
    deviceId,
    pollingInterval: 10000,
    enabled: true,
    onNewEvent: (event) => {
      console.log("🔔 New event in dashboard:", event);
    },
  });

  // Handle remote unlock
  const handleOpenDoor = useCallback(async () => {
    try {
      console.log("🔓 Opening door remotely...");

      const response = await fetch("/api/smartlock/door-control/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Door unlocked successfully!");
      } else {
        throw new Error(result.error || "Failed to unlock");
      }
    } catch (error: any) {
      console.error("Error unlocking door:", error);
      alert("❌ Failed to unlock door: " + error.message);
    }
  }, [deviceId]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar deviceId={deviceId} />

      {/* Main content area */}
      <main className="flex-1 lg:ml-0 relative">
        {/* Polling indicator - top right */}
        <div className="fixed top-4 right-4 z-40">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border shadow-sm ${
              isPolling
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                : "bg-card text-muted-foreground border-border"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isPolling ? "bg-blue-500 animate-pulse" : "bg-muted-foreground"
              }`}
            />
            <span>{isPolling ? "Checking..." : "Listening"}</span>
          </div>
        </div>

        {/* Event Notification Dialog */}
        <EventNotificationDialog
          event={latestEvent}
          onDismiss={dismissLatest}
          onOpenDoor={handleOpenDoor}
          autoHideAfter={30000}
        />

        {/* Page content */}
        {children}
      </main>
    </div>
  );
}
