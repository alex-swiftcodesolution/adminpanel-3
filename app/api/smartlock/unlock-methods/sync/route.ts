/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/unlock-methods/sync/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function POST(request: NextRequest) {
  try {
    const { deviceId, codes } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    console.log("🔄 Syncing unlock methods for device:", deviceId);

    // Use provided codes or let the wrapper use defaults
    const codesArray = codes && Array.isArray(codes) ? codes : undefined;

    const result = await TuyaSmartLockAPI.UnlockMethod.syncUnlockMethods(
      deviceId,
      codesArray
    );

    console.log("✅ Sync result:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
