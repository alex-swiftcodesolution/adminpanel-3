/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/media/view-count/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const viewCount = await TuyaSmartLockAPI.Media.getMediaViewTimes(deviceId);

    return NextResponse.json({ success: true, data: viewCount });
  } catch (error: any) {
    console.error("Error fetching view count:", error);
    // Return 0 for unsupported features
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: { view_times: 0 },
        unsupported:
          error.message.includes("permission") ||
          error.message.includes("deny"),
      },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.Media.incrementMediaViewTimes(
      deviceId
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error incrementing view count:", error);
    // Silently fail for unsupported features
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: false,
        unsupported:
          error.message.includes("permission") ||
          error.message.includes("deny"),
      },
      { status: 200 }
    );
  }
}
