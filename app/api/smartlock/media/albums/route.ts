/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/media/albums/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const startTime = request.nextUrl.searchParams.get("startTime");
    const endTime = request.nextUrl.searchParams.get("endTime");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const params: any = {};
    if (startTime) params.start_time = parseInt(startTime);
    if (endTime) params.end_time = parseInt(endTime);

    console.log("📚 Fetching albums for device:", deviceId);

    const albums = await TuyaSmartLockAPI.Media.getAlbums(deviceId, params);

    console.log("✅ Albums result:", albums);

    return NextResponse.json({
      success: true,
      data: albums,
    });
  } catch (error: any) {
    console.error("Error fetching albums:", error);
    // Return empty response for unsupported features (permission deny)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: { album_list: [], event_types: [], order_code: null },
        unsupported:
          error.message.includes("permission") ||
          error.message.includes("deny"),
      },
      { status: 200 }
    );
  }
}
