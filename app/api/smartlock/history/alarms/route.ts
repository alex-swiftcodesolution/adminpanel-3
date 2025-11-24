/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/history/alarms/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deviceId = searchParams.get("deviceId");
    const codes = searchParams.get("codes");
    const pageNo = searchParams.get("pageNo");
    const pageSize = searchParams.get("pageSize");
    const showMediaInfo = searchParams.get("showMediaInfo");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const params = {
      page_no: pageNo ? parseInt(pageNo) : 1,
      page_size: pageSize ? parseInt(pageSize) : 20,
      codes: codes || "alarm_lock,hijack,doorbell",
      show_media_info: showMediaInfo !== "false",
    };

    console.log("🚨 Fetching alarm logs with params:", params);

    const result = await TuyaSmartLockAPI.History.getAlarmLogsV11(
      deviceId,
      params
    );

    console.log(
      `✅ Retrieved ${result.records.length} alarm records (total: ${result.total})`
    );

    // Debug log - remove after testing
    console.log(
      "📋 Alarm records detail:",
      JSON.stringify(result.records, null, 2)
    );

    return NextResponse.json({
      success: true,
      data: {
        total: result.total,
        records: result.records,
        page_no: params.page_no,
        page_size: params.page_size,
        has_more: params.page_no * params.page_size < result.total,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching alarm logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: {
          total: 0,
          records: [],
          page_no: 1,
          page_size: 20,
          has_more: false,
        },
      },
      { status: 200 }
    );
  }
}
