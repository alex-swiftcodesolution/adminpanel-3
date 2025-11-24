/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/unlock-methods/enroll/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function POST(request: NextRequest) {
  try {
    const { deviceId, unlockType, userId, userType } = await request.json();

    if (!deviceId || !unlockType || !userId || userType === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("🔐 Enrolling unlock method:", {
      deviceId,
      unlockType,
      userId,
      userType,
    });

    const result = await TuyaSmartLockAPI.UnlockMethod.enrollUnlockMethod(
      deviceId,
      {
        unlock_type: unlockType,
        user_id: userId,
        user_type: userType,
      }
    );

    console.log("✅ Enrollment initiated:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Enrollment error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
