// app/api/smartlock/unlock-methods/assign/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function POST(request: NextRequest) {
  try {
    const { deviceId, userId, unlockMethods } = await request.json();

    if (!deviceId || !userId || !unlockMethods) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.UnlockMethod.assignUnlockMethods(
      deviceId,
      {
        user_id: userId,
        unlock_methods: unlockMethods,
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
