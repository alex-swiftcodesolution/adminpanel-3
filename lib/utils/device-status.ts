// lib/utils/device-status.ts

export interface DeviceOnlineStatus {
  online: boolean;
  reportedOnline: boolean;
  lastUpdate: number | null;
  isStale: boolean;
  timeAgo: string;
}

export interface DeviceLockStatus {
  lockState: "locked" | "unlocked" | "unknown";
  battery: number | null;
  online: boolean;
  reportedOnline: boolean;
  lastUpdate: number | null;
  isStale: boolean;
  timeAgo: string;
}

const STALE_THRESHOLD_SECONDS = 300; // 5 minutes

/**
 * Check if update time is stale (older than threshold)
 */
export function isStatusStale(updateTime: number): boolean {
  if (!updateTime) return true;
  const now = Math.floor(Date.now() / 1000);
  return updateTime < now - STALE_THRESHOLD_SECONDS;
}

/**
 * Get human-readable time ago string
 */
export function getTimeAgo(timestamp: number | null): string {
  if (!timestamp) return "Unknown";

  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 0) return "Just now";
  if (diff < 60) return "Just now";
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  const days = Math.floor(diff / 86400);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

/**
 * Format timestamp to readable date/time
 */
export function formatLastUpdate(timestamp: number | null): string {
  if (!timestamp) return "Unknown";
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Calculate true online status from device data
 */
export function calculateOnlineStatus(deviceData: {
  online?: boolean;
  update_time?: number;
}): DeviceOnlineStatus {
  const reportedOnline = deviceData.online || false;
  const updateTime = deviceData.update_time || 0;
  const stale = isStatusStale(updateTime);
  const actuallyOnline = reportedOnline && !stale;

  return {
    online: actuallyOnline,
    reportedOnline,
    lastUpdate: updateTime || null,
    isStale: stale,
    timeAgo: getTimeAgo(updateTime),
  };
}

/**
 * Extract full device status from Tuya device info response
 */
export function extractDeviceStatus(deviceData: {
  online?: boolean;
  update_time?: number;
  status?: Array<{ code: string; value: unknown }>;
}): DeviceLockStatus {
  const onlineStatus = calculateOnlineStatus(deviceData);
  const statusArray = deviceData.status || [];

  // Extract lock_motor_state (false = locked, true = unlocked)
  const lockMotorState = statusArray.find((s) => s.code === "lock_motor_state");

  // Extract battery level
  const batteryStatus = statusArray.find(
    (s) => s.code === "residual_electricity"
  );

  let lockState: "locked" | "unlocked" | "unknown" = "unknown";
  if (lockMotorState?.value === true) {
    lockState = "unlocked";
  } else if (lockMotorState?.value === false) {
    lockState = "locked";
  }

  return {
    lockState,
    battery:
      typeof batteryStatus?.value === "number" ? batteryStatus.value : null,
    ...onlineStatus,
  };
}
