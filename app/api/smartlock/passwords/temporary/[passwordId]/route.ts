/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/passwords/temporary/[passwordId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

// Get single temporary password
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ passwordId: string }> }
) {
  try {
    const { passwordId } = await params; // ✅ AWAIT params
    const deviceId = request.nextUrl.searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const password = await TuyaSmartLockAPI.Password.getTempPassword(
      deviceId,
      passwordId
    );

    console.log(password);

    return NextResponse.json({ success: true, data: password });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Update temporary password
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ passwordId: string }> }
) {
  try {
    const { passwordId } = await params; // ✅ AWAIT params
    const { deviceId, ...updateData } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.Password.modifyTempPassword(
      deviceId,
      passwordId,
      updateData
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete temporary password
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ passwordId: string }> }
) {
  try {
    const { passwordId } = await params;
    const deviceId = request.nextUrl.searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.Password.deleteTempPassword(
      deviceId,
      passwordId
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    // Handle specific Tuya error codes
    if (error.message?.includes("password has expired")) {
      return NextResponse.json(
        { success: false, error: "Password has already expired" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
