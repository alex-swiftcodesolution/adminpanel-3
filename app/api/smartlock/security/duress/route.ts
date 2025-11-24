/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/security/duress/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

// Set duress alarm
export async function POST(request: NextRequest) {
  try {
    const { deviceId, unlockType, unlockNo } = await request.json();

    if (!deviceId || unlockType === undefined || unlockNo === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.Security.setDuressAlarm(
      deviceId,
      unlockType,
      unlockNo
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete duress alarm
export async function DELETE(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const unlockType = request.nextUrl.searchParams.get("unlockType");
    const unlockSn = request.nextUrl.searchParams.get("unlockSn");

    if (!deviceId || !unlockType || !unlockSn) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.Security.deleteDuressAlarm(
      deviceId,
      parseInt(unlockType),
      unlockSn
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
