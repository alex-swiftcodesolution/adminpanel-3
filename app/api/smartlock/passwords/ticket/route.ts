// app/api/smartlock/passwords/ticket/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const ticket = await TuyaSmartLockAPI.Password.getPasswordTicket(deviceId);

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error("Password ticket error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
