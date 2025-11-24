/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/media/url/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

// GET - Get signed URL for specific media
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deviceId = searchParams.get("deviceId");
    const bucket = searchParams.get("bucket");
    const filePath = searchParams.get("filePath");
    const mediaBucket = searchParams.get("mediaBucket");
    const mediaPath = searchParams.get("mediaPath");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    if (!bucket || !filePath) {
      return NextResponse.json(
        { error: "bucket and filePath are required" },
        { status: 400 }
      );
    }

    console.log("🔗 Fetching media URL for:", { deviceId, bucket, filePath });

    const result = await TuyaSmartLockAPI.Media.getMediaUrl(deviceId, {
      bucket,
      file_path: filePath,
      media_bucket: mediaBucket || undefined,
      media_path: mediaPath || undefined,
    });

    console.log("✅ Media URL result:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error fetching media URL:", error);
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
