/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/door-control/remote-methods/route.ts

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

    console.log("🔍 Fetching remote methods for device:", deviceId);

    const methods = await TuyaSmartLockAPI.DoorControl.getRemoteUnlockMethods(
      deviceId
    );

    console.log("✅ Remote methods retrieved:", methods);
    return NextResponse.json({ success: true, data: methods });
  } catch (error: any) {
    console.error("❌ Error fetching remote methods:", error);
    return NextResponse.json(
      { success: false, error: error.message, data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { deviceId, remote_unlock_type, open } = await request.json();

    if (!deviceId || !remote_unlock_type || open === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields: deviceId, remote_unlock_type, open",
        },
        { status: 400 }
      );
    }

    // Validate remote_unlock_type
    const validTypes = ["remoteUnlockWithoutPwd", "remoteUnlockWithPwd"];
    if (!validTypes.includes(remote_unlock_type)) {
      return NextResponse.json(
        {
          error: `Invalid remote_unlock_type. Must be one of: ${validTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    console.log("⚙️ Configuring remote unlock:", {
      deviceId,
      remote_unlock_type,
      open,
    });

    const result = await TuyaSmartLockAPI.DoorControl.configureRemoteUnlock(
      deviceId,
      {
        remote_unlock_type,
        open,
      }
    );

    console.log("✅ Configuration result:", result);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error configuring remote unlock:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
