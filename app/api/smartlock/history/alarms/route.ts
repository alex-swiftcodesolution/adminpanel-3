// app/api/smartlock/history/alarms/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";
import { extractArray } from "@/lib/utils/array-helpers";

/*
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

    const logs = await TuyaSmartLockAPI.History.getAlarmLogs(deviceId, params);

    const dataArray = extractArray(logs);

    return NextResponse.json({ success: true, data: dataArray });
  } catch (error: any) {
    console.error("Error fetching alarm logs:", error);
    return NextResponse.json(
      { success: false, error: error.message, data: [] }, // Return empty array on error
      { status: 200 } // Changed to 200 to prevent error state in UI
    );
  }
}
*/

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const codes = request.nextUrl.searchParams.get("codes");
    const pageNo = request.nextUrl.searchParams.get("pageNo");
    const pageSize = request.nextUrl.searchParams.get("pageSize");
    const showMediaInfo = request.nextUrl.searchParams.get("showMediaInfo");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const params = {
      codes: codes || "doorbell", // Default to doorbell events
      page_no: pageNo ? parseInt(pageNo) : 1,
      page_size: pageSize ? parseInt(pageSize) : 10,
      show_media_info: showMediaInfo !== "false", // Default to true
    };

    const logs = await TuyaSmartLockAPI.History.getAlarmLogsV11(
      deviceId,
      params
    );

    const dataArray = extractArray(logs);
    console.log(dataArray);

    return NextResponse.json({ success: true, data: dataArray });
  } catch (error: any) {
    console.error("Error fetching alarm logs:", error);
    return NextResponse.json(
      { success: false, error: error.message, data: [] },
      { status: 200 }
    );
  }
}
