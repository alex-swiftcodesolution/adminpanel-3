/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/users/[userId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

// Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params; // ✅ Await params
    const deviceId = request.nextUrl.searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    const user = await TuyaSmartLockAPI.User.getDeviceUser(deviceId, userId);

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Update user - ✅ FIXED
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params; // ✅ Await params
    const { deviceId, nick_name, sex, contact, birthday, height, weight } =
      await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    // ✅ Build update data with correct field names
    const updateData: any = {};

    if (nick_name !== undefined) updateData.nick_name = nick_name;
    if (sex !== undefined) updateData.sex = sex;
    if (contact !== undefined) updateData.contact = contact;
    if (birthday !== undefined) updateData.birthday = birthday;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;

    console.log("📝 Updating user:", { userId, updateData });

    const result = await TuyaSmartLockAPI.User.modifyDeviceUser(
      deviceId,
      userId,
      updateData
    );

    console.log("✅ User updated:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error updating user:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete user - ✅ FIXED
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params; // ✅ Await params
    const deviceId = request.nextUrl.searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    console.log("🗑️ Deleting user:", { userId, deviceId });

    const result = await TuyaSmartLockAPI.User.deleteDeviceUser(
      deviceId,
      userId
    );

    console.log("✅ User deleted:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
