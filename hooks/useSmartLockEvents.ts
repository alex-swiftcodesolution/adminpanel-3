/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { CombinedRecordItem } from "@/lib/tuya/tuya-api-wrapper";

interface UseSmartLockEventsOptions {
  deviceId: string;
  pollingInterval?: number;
  enabled?: boolean;
  onNewEvent?: (event: CombinedRecordItem) => void;
}

export function useSmartLockEvents({
  deviceId,
  pollingInterval = 10000,
  enabled = true,
  onNewEvent,
}: UseSmartLockEventsOptions) {
  const [latestEvent, setLatestEvent] = useState<CombinedRecordItem | null>(
    null
  );
  const [events, setEvents] = useState<CombinedRecordItem[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastSeenTimestampRef = useRef<number>(0);
  const isInitialLoadRef = useRef(true);

  const fetchLatestEvents = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsPolling(true);
      setError(null);

      const now = Date.now();
      const thirtySecondsAgo = now - 30000;

      const response = await fetch(
        `/api/smartlock/history/combined?` +
          new URLSearchParams({
            deviceId,
            pageNo: "1",
            pageSize: "5",
            startTime: thirtySecondsAgo.toString(),
            endTime: now.toString(),
          })
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const { data } = await response.json();
      const records: CombinedRecordItem[] = data.records || [];

      if (isInitialLoadRef.current && records.length > 0) {
        lastSeenTimestampRef.current = records[0].gmt_create;
        isInitialLoadRef.current = false;
        console.log(
          "📍 Initial load - baseline:",
          new Date(records[0].gmt_create).toLocaleString()
        );
        return;
      }

      if (records.length > 0) {
        const newestEvent = records[0];

        if (newestEvent.gmt_create > lastSeenTimestampRef.current) {
          console.log("🔔 NEW EVENT DETECTED:", newestEvent);

          setLatestEvent(newestEvent);
          setEvents((prev) => [newestEvent, ...prev.slice(0, 49)]);

          lastSeenTimestampRef.current = newestEvent.gmt_create;

          playNotificationSound(newestEvent);

          onNewEvent?.(newestEvent);
        }
      }
    } catch (err: any) {
      console.error("Error polling events:", err);
      setError(err.message);
    } finally {
      setIsPolling(false);
    }
  }, [deviceId, enabled, onNewEvent]);

  useEffect(() => {
    if (!enabled) return;

    console.log(
      `🔄 Starting polling for ${deviceId} (${pollingInterval}ms interval)`
    );

    fetchLatestEvents();

    const interval = setInterval(fetchLatestEvents, pollingInterval);

    return () => {
      console.log("🛑 Stopping polling");
      clearInterval(interval);
    };
  }, [deviceId, pollingInterval, enabled, fetchLatestEvents]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setLatestEvent(null);
  }, []);

  const dismissLatest = useCallback(() => {
    setLatestEvent(null);
  }, []);

  return {
    latestEvent,
    events,
    isPolling,
    error,
    clearEvents,
    dismissLatest,
  };
}

function playNotificationSound(event: CombinedRecordItem) {
  try {
    let soundFile = "/notification.mp3";

    if (event.record_type === "alarm") {
      soundFile = "/alarm.mp3";
    } else {
      const firstDp = event.dps[0];
      if (firstDp) {
        const dpCode = Object.keys(firstDp)[0];
        if (dpCode === "doorbell") {
          soundFile = "/doorbell.mp3";
        } else if (dpCode.includes("unlock")) {
          soundFile = "/unlock.mp3";
        }
      }
    }

    const audio = new Audio(soundFile);
    audio.volume = 0.5;
    audio.play().catch((err) => {
      console.warn("Could not play sound:", err);
    });
  } catch (error) {
    console.warn("Error playing sound:", error);
  }
}
