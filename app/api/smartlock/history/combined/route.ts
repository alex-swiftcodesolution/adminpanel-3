// app/api/smartlock/history/combined/route.ts

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

    const params: any = {};
    if (startTime) params.start_time = parseInt(startTime);
    if (endTime) params.end_time = parseInt(endTime);
    if (pageSize) params.page_size = parseInt(pageSize);

    const records = await TuyaSmartLockAPI.History.getCombinedRecords(
      deviceId,
      params
    );

    const dataArray = extractArray(records);

    return NextResponse.json({ success: true, data: dataArray });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
