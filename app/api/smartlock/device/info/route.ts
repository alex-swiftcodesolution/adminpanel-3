/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/device/info/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const deviceInfo = await TuyaSmartLockAPI.Device.getDeviceInfo(deviceId);
    console.log(deviceInfo);

    return NextResponse.json({ success: true, data: deviceInfo });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
