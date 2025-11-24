// app/api/smartlock/passwords/offline/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function POST(request: NextRequest) {
  try {
    const { deviceId, effectiveTime, invalidTime } = await request.json();

    if (!deviceId || !effectiveTime || !invalidTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.Password.getOfflinePassword(
      deviceId,
      {
        effective_time: effectiveTime,
        invalid_time: invalidTime,
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
