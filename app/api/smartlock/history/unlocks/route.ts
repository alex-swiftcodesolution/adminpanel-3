// app/api/smartlock/history/unlocks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";
import { extractArray } from "@/lib/utils/array-helpers";

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const startTime = request.nextUrl.searchParams.get("startTime");
    const endTime = request.nextUrl.searchParams.get("endTime");
    const pageSize = request.nextUrl.searchParams.get("pageSize");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    // Default to last 30 days if no time range specified
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    const params: any = {
      start_time: startTime ? parseInt(startTime) : thirtyDaysAgo,
      end_time: endTime ? parseInt(endTime) : now,
    };

    if (pageSize) {
      params.page_size = parseInt(pageSize);
    }

    const logs = await TuyaSmartLockAPI.History.getUnlockLogs(deviceId, params);

    // Ensure we return an array
    let logsArray = [];
    if (Array.isArray(logs)) {
      logsArray = logs;
    } else if (logs && typeof logs === "object") {
      // Check for common array property names in Tuya responses
      logsArray =
        logs.unlock_logs || logs.data || logs.list || logs.result || [];
    }

    const dataArray = extractArray(logsArray);

    return NextResponse.json({ success: true, data: dataArray });
  } catch (error: any) {
    console.error("Error fetching unlock logs:", error);
    return NextResponse.json(
      { success: false, error: error.message, data: [] },
      { status: 200 } // Return 200 to prevent error state in UI
    );
  }
}
