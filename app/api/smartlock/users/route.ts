// app/api/smartlock/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";
import { extractArray } from "@/lib/utils/array-helpers";

// Create user
export async function POST(request: NextRequest) {
  try {
    const { deviceId, userName, userType, avatar } = await request.json();

    if (!deviceId || !userName || !userType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await TuyaSmartLockAPI.User.createDeviceUser(deviceId, {
      user_name: userName,
      user_type: userType,
      avatar,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get all users
export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const type = request.nextUrl.searchParams.get("type") || "device";

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    let users;
    if (type === "home") {
      users = await TuyaSmartLockAPI.User.getHomeUsers(deviceId);
    } else {
      users = await TuyaSmartLockAPI.User.getDeviceUsers(deviceId);
    }

    const dataArray = extractArray(users);
    console.log(dataArray);

    return NextResponse.json({ success: true, data: dataArray });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
