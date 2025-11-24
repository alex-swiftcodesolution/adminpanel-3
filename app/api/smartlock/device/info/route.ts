/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/device/info/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";
import { isStatusStale } from "@/lib/utils/device-status";

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const deviceInfo = await TuyaSmartLockAPI.Device.getDeviceInfo(deviceId);
    console.log(deviceInfo);

    // Calculate true online status
    const reportedOnline = deviceInfo.online || false;
    const updateTime = (deviceInfo as any).update_time || 0;
    const stale = isStatusStale(updateTime);
    const actuallyOnline = reportedOnline && !stale;

    // Return enriched data - preserves all original fields
    // Only overrides `online` with accurate value and adds `_meta`
    const enrichedData = {
      ...deviceInfo,
      online: actuallyOnline,
      _meta: {
        reported_online: reportedOnline,
        update_time: updateTime,
        is_stale: stale,
        stale_threshold_seconds: 300,
        calculated_at: Math.floor(Date.now() / 1000),
      },
    };

    return NextResponse.json({ success: true, data: enrichedData });
  } catch (error: any) {
    console.error("❌ Error fetching device info:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
