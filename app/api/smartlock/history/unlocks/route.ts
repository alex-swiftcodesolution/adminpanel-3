/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/history/unlocks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deviceId = searchParams.get("deviceId");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");
    const pageNo = searchParams.get("pageNo");
    const pageSize = searchParams.get("pageSize");
    const showMediaInfo = searchParams.get("showMediaInfo");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    // Default to last 30 days if no time range specified
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    const params = {
      page_no: pageNo ? parseInt(pageNo) : 1,
      page_size: pageSize ? parseInt(pageSize) : 20,
      start_time: startTime ? parseInt(startTime) : thirtyDaysAgo,
      end_time: endTime ? parseInt(endTime) : now,
      show_media_info: showMediaInfo !== "false",
    };

    console.log("📜 Fetching unlock logs with params:", params);

    // Use v1.1 for media info support
    const result = await TuyaSmartLockAPI.History.getUnlockLogsV11(
      deviceId,
      params
    );

    console.log(
      `✅ Retrieved ${result.logs.length} unlock records (total: ${result.total})`
    );

    return NextResponse.json({
      success: true,
      data: {
        total: result.total,
        logs: result.logs,
        page_no: params.page_no,
        page_size: params.page_size,
        has_more: params.page_no * params.page_size < result.total,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching unlock logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: {
          total: 0,
          logs: [],
          page_no: 1,
          page_size: 20,
          has_more: false,
        },
      },
      { status: 200 }
    );
  }
}
