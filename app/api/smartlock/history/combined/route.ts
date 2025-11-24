/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/history/combined/route.ts

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
    const dpCodes = searchParams.get("dpCodes");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const params = {
      page_no: pageNo ? parseInt(pageNo) : 1,
      page_size: pageSize ? parseInt(pageSize) : 20,
      start_time: startTime ? parseInt(startTime) : 0,
      end_time: endTime ? parseInt(endTime) : 0,
      target_standard_dp_codes: dpCodes || undefined,
    };

    console.log("📋 Fetching combined records with params:", params);

    const result = await TuyaSmartLockAPI.History.getCombinedRecords(
      deviceId,
      params
    );

    console.log(
      `✅ Retrieved ${result.records.length} combined records (total: ${result.total})`
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Error fetching combined records:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: {
          total: 0,
          total_pages: 0,
          has_more: false,
          records: [],
        },
      },
      { status: 200 }
    );
  }
}
