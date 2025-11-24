/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/history/link-user/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function POST(request: NextRequest) {
  try {
    const { deviceId, recordId, userId } = await request.json();

    if (!deviceId || !recordId || !userId) {
      return NextResponse.json(
        {
          error: "Missing required fields: deviceId, recordId, userId",
        },
        { status: 400 }
      );
    }

    console.log("🔗 Linking record to user:", { deviceId, recordId, userId });

    const result = await TuyaSmartLockAPI.History.linkRecordToUser(
      deviceId,
      recordId,
      userId
    );

    console.log("✅ Link result:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error linking record to user:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
