/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/unlock-methods/assigned/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";
import { extractArray } from "@/lib/utils/array-helpers";

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const userType = request.nextUrl.searchParams.get("userType");
    const userId = request.nextUrl.searchParams.get("userId");

    if (!deviceId || !userType || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const methods = await TuyaSmartLockAPI.UnlockMethod.getAssignedKeys(
      deviceId,
      parseInt(userType),
      userId
    );

    const dataArray = extractArray(methods);

    return NextResponse.json({ success: true, data: dataArray });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
