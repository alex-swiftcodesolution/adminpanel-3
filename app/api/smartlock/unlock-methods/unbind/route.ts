/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/unlock-methods/unbind/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

// ✅ UNBIND - Unbind unlock method from user
export async function POST(request: NextRequest) {
  try {
    const { deviceId, userId, unlockList } = await request.json();

    if (!deviceId || !userId || !unlockList || !Array.isArray(unlockList)) {
      return NextResponse.json(
        { error: "Missing required fields: deviceId, userId, unlockList" },
        { status: 400 }
      );
    }

    console.log("🔓 Unbinding unlock methods:", {
      deviceId,
      userId,
      unlockList,
    });

    const result = await TuyaSmartLockAPI.UnlockMethod.unbindUnlockMethods(
      deviceId,
      {
        user_id: userId,
        unlock_list: unlockList,
      }
    );

    console.log("✅ Methods unbound:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error unbinding methods:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
