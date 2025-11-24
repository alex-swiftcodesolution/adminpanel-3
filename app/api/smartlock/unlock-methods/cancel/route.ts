/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/unlock-methods/cancel/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

// POST - Cancel ongoing enrollment
export async function POST(request: NextRequest) {
  try {
    const { deviceId, unlockType } = await request.json();

    if (!deviceId || !unlockType) {
      return NextResponse.json(
        { error: "Device ID and unlock type are required" },
        { status: 400 }
      );
    }

    console.log("❌ Canceling enrollment:", { deviceId, unlockType });

    const result = await TuyaSmartLockAPI.UnlockMethod.cancelEnrollment(
      deviceId,
      unlockType
    );

    console.log("✅ Enrollment canceled:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error canceling enrollment:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
