/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/media/latest/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const fileType = request.nextUrl.searchParams.get("fileType");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    // fileType: 1 = Remote door opening, 2 = Alarm (default)
    const type = fileType === "1" ? 1 : 2;

    console.log(
      "📸 Fetching latest media for device:",
      deviceId,
      "type:",
      type
    );

    const media = await TuyaSmartLockAPI.Media.getLatestMediaUrl(
      deviceId,
      type as 1 | 2
    );

    console.log("✅ Latest media:", media);

    return NextResponse.json({ success: true, data: media });
  } catch (error: any) {
    console.error("❌ Error fetching latest media:", error);
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
