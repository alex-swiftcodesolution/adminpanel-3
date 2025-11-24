/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/unlock-methods/[unlockSn]/attributes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ unlockSn: string }> }
) {
  try {
    const { unlockSn } = await params;
    const { deviceId, attribute, enabled } = await request.json();

    if (!deviceId || attribute === undefined || enabled === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: deviceId, attribute, enabled" },
        { status: 400 }
      );
    }

    console.log("⚙️ Setting unlock method attribute:", {
      unlockSn,
      deviceId,
      attribute,
      enabled,
    });

    const result = await TuyaSmartLockAPI.UnlockMethod.setUnlockMethodAttribute(
      deviceId,
      parseInt(unlockSn),
      attribute as 1 | 2,
      enabled
    );

    console.log("✅ Attribute set:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error setting attribute:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
