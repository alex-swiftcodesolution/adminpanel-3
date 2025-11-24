// app/api/smartlock/unlock-methods/enroll/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function POST(request: NextRequest) {
  try {
    const { deviceId, unlockType, userId, userType } = await request.json();

    if (!deviceId || !unlockType || !userId || !userType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.UnlockMethod.enrollUnlockMethod(
      deviceId,
      {
        unlock_type: unlockType,
        user_id: userId,
        user_type: userType,
      }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
