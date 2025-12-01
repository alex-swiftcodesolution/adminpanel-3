/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/users/[userId]/role/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> } // ← Promise now
) {
  try {
    const { deviceId, role } = await request.json();

    if (!deviceId || role === undefined) {
      return NextResponse.json(
        { error: "Device ID and role are required" },
        { status: 400 }
      );
    }

    const { userId } = await params;

    const result = await TuyaSmartLockAPI.User.updateUserRole(
      deviceId,
      userId, // ← now safe to use
      role
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
