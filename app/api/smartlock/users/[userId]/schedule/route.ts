// app/api/smartlock/users/[userId]/schedule/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { deviceId, effectiveTime, invalidTime, schedule } =
      await request.json();

    if (!deviceId || !effectiveTime || !invalidTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.User.updateHomeUserSchedule(
      deviceId,
      params.userId,
      {
        effective_time: effectiveTime,
        invalid_time: invalidTime,
        schedule,
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
