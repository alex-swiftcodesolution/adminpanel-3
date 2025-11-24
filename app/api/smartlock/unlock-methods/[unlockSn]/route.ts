// app/api/smartlock/unlock-methods/[unlockSn]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

// Update unlock method name
export async function PUT(
  request: NextRequest,
  { params }: { params: { unlockSn: string } }
) {
  try {
    const { deviceId, name } = await request.json();

    if (!deviceId || !name) {
      return NextResponse.json(
        { error: "Device ID and name are required" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.UnlockMethod.updateUnlockMethodName(
      deviceId,
      params.unlockSn,
      name
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete unlock method
export async function DELETE(
  request: NextRequest,
  { params }: { params: { unlockSn: string } }
) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const userType = request.nextUrl.searchParams.get("userType");
    const userId = request.nextUrl.searchParams.get("userId");
    const unlockType = request.nextUrl.searchParams.get("unlockType");
    const unlockNo = request.nextUrl.searchParams.get("unlockNo");

    if (!deviceId || !userType || !userId || !unlockType || !unlockNo) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.UnlockMethod.deleteUnlockMethod(
      deviceId,
      parseInt(userType),
      userId,
      parseInt(unlockType),
      parseInt(unlockNo)
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
