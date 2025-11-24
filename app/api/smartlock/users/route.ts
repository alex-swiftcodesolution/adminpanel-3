/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";
import { extractArray } from "@/lib/utils/array-helpers";

// ✅ CREATE USER - FIXED
export async function POST(request: NextRequest) {
  try {
    // ✅ FIXED: Extract correct field names
    const { deviceId, nickName, sex, contact, birthday, height, weight } =
      await request.json();

    console.log("📥 Received create user request:", {
      deviceId,
      nickName,
      sex,
      contact,
      birthday,
      height,
      weight,
    });

    // ✅ Validate required fields
    if (!deviceId || !nickName || sex === undefined) {
      return NextResponse.json(
        {
          error: "Missing required fields: deviceId, nickName, sex",
          received: { deviceId, nickName, sex },
        },
        { status: 400 }
      );
    }

    // ✅ Validate sex value
    if (sex !== 1 && sex !== 2) {
      return NextResponse.json(
        { error: "Sex must be 1 (male) or 2 (female)" },
        { status: 400 }
      );
    }

    console.log("👤 Creating user:", { nickName, sex, contact });

    // ✅ Call API with correct field names
    const result = await TuyaSmartLockAPI.User.createDeviceUser(deviceId, {
      nick_name: nickName, // ✅ Convert to snake_case for API
      sex: sex as 1 | 2,
      contact,
      birthday,
      height,
      weight,
    });

    console.log("✅ User created:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error creating user:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET all users (keep existing - it works)
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
    if (type === "smart-lock") {
      users = await TuyaSmartLockAPI.User.getSmartLockUsers(deviceId, {
        codes: [
          "unlock_fingerprint",
          "unlock_password",
          "unlock_card",
          "unlock_face",
        ],
        page_no: 1,
        page_size: 100,
      });

      return NextResponse.json({
        success: true,
        data: users.records || [],
        pagination: {
          total: users.total || 0,
          has_more: users.has_more || false,
        },
      });
    } else {
      users = await TuyaSmartLockAPI.User.getDeviceUsers(deviceId);
      const dataArray = extractArray(users);
      console.log("👥 Users:", dataArray);

      return NextResponse.json({ success: true, data: dataArray });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
