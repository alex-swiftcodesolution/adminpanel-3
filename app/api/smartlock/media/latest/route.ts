// app/api/smartlock/media/latest/route.ts

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

    const media = await TuyaSmartLockAPI.Media.getLatestMediaUrl(deviceId);

    return NextResponse.json({ success: true, data: media });
  } catch (error: any) {
    console.error("Error fetching latest media:", error);
    // Return empty response instead of error for unsupported features
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: null,
        unsupported:
          error.message.includes("permission") ||
          error.message.includes("deny"),
      },
      { status: 200 }
    );
  }
}
