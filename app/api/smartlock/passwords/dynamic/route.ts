/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/passwords/dynamic/route.ts

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

    const dynamicPassword = await TuyaSmartLockAPI.Password.getDynamicPassword(
      deviceId
    );

    console.log(dynamicPassword);

    return NextResponse.json({ success: true, data: dynamicPassword });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
