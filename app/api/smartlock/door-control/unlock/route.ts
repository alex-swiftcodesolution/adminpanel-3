// app/api/smartlock/door-control/unlock/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function POST(request: NextRequest) {
  try {
    const { deviceId, password } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    let result;
    if (password) {
      result = await TuyaSmartLockAPI.DoorControl.unlockWithPassword(deviceId, {
        password,
      });
    } else {
      result = await TuyaSmartLockAPI.DoorControl.unlockWithoutPassword(
        deviceId
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
