// app/api/smartlock/door-control/remote-methods/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";
import { extractArray } from "@/lib/utils/array-helpers";

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const methods = await TuyaSmartLockAPI.DoorControl.getRemoteUnlockMethods(
      deviceId
    );

    return NextResponse.json({ success: true, data: methods });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { deviceId, unlockType, isEnabled } = await request.json();

    if (!deviceId || unlockType === undefined || isEnabled === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.DoorControl.configureRemoteUnlock(
      deviceId,
      {
        unlock_type: unlockType,
        is_enabled: isEnabled,
      }
    );

    const dataArray = extractArray(result);

    return NextResponse.json({ success: true, data: dataArray });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
