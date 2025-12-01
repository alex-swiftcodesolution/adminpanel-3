/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/unlock-methods/remote-settings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

// GET - Fetch remote unlock settings
export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching remote unlock settings for device:", deviceId);

    const settings = await TuyaSmartLockAPI.DoorControl.getRemoteUnlockMethods(
      deviceId
    );

    console.log("✅ Remote settings retrieved:", settings);

    // Ensure it's an array
    const settingsArray = Array.isArray(settings) ? settings : [settings];

    return NextResponse.json({
      success: true,
      data: settingsArray,
    });
  } catch (error: any) {
    console.error("❌ Error fetching remote settings:", error);
    return NextResponse.json(
      { success: false, error: error.message, data: [] },
      { status: 500 }
    );
  }
}

// POST - Update remote unlock setting
export async function POST(request: NextRequest) {
  try {
    const { deviceId, unlock_type, is_enabled } = await request.json();

    if (!deviceId || unlock_type === undefined || is_enabled === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields: deviceId, unlock_type, is_enabled",
        },
        { status: 400 }
      );
    }

    console.log("⚙️ Updating remote unlock setting:", {
      deviceId,
      unlock_type,
      is_enabled,
    });

    const result = await TuyaSmartLockAPI.DoorControl.configureRemoteUnlock(
      deviceId,
      {
        remote_unlock_type: unlock_type as
          | "remoteUnlockWithoutPwd"
          | "remoteUnlockWithPwd",
        open: is_enabled,
      }
    );

    console.log("✅ Setting updated:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error updating remote setting:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
