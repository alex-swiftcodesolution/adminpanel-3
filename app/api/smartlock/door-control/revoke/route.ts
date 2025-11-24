/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/door-control/revoke/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function POST(request: NextRequest) {
  try {
    const { deviceId, type = 1 } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    // Validate type
    if (type !== 1 && type !== 2) {
      return NextResponse.json(
        { error: "Type must be 1 (owner rejects) or 2 (initiator cancels)" },
        { status: 400 }
      );
    }

    console.log("🚫 Revoke request for device:", deviceId, "Type:", type);

    const result = await TuyaSmartLockAPI.DoorControl.revokePasswordFreeUnlock(
      deviceId,
      { type }
    );

    console.log("✅ Revoke result:", result);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Revoke error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
