/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/passwords/temporary/[passwordId]/freeze/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ passwordId: string }> }
) {
  try {
    const { passwordId } = await params; // ✅ AWAIT params
    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.Password.freezeTempPassword(
      deviceId,
      passwordId
    );

    console.log(result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
