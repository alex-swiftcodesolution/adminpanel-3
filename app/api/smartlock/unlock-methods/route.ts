/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/unlock-methods/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

// ✅ READ - Get unlock methods (unassigned or for specific user)
export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const userId = request.nextUrl.searchParams.get("userId");
    const userType = request.nextUrl.searchParams.get("userType");
    const unlockType = request.nextUrl.searchParams.get("unlockType");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    console.log("📥 Request params:", {
      deviceId,
      userId,
      userType,
      unlockType,
    });

    let methods;

    if (userId) {
      // ✅ Use detailed endpoint with ALL required parameters
      console.log("🔍 Fetching detailed unlock methods for user:", userId);

      const result =
        await TuyaSmartLockAPI.UnlockMethod.getDetailedUserUnlockMethods(
          deviceId,
          userId,
          {
            codes: [
              "unlock_fingerprint",
              "unlock_password",
              "unlock_card",
              "unlock_face",
              "unlock_hand",
              "unlock_finger_vein",
              "unlock_eye",
              "unlock_telecontrol_kit",
            ],
            unlock_name: "", // ✅ Required: empty string to get all
            page_no: 1, // ✅ Required
            page_size: 100, // ✅ Required - get all methods
          }
        );

      methods = result.records || [];

      console.log(`✅ Found ${methods.length} methods for user ${userId}`);
    } else {
      // Get unassigned methods
      console.log("🔍 Fetching unassigned unlock methods");
      methods = await TuyaSmartLockAPI.UnlockMethod.getUnassignedKeys(
        deviceId,
        unlockType || undefined
      );
    }

    console.log("✅ Methods retrieved:", methods);

    return NextResponse.json({
      success: true,
      data: methods,
      count: methods.length,
    });
  } catch (error: any) {
    console.error("❌ Error in unlock-methods API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: [],
      },
      { status: 500 }
    );
  }
}

// ✅ CREATE - Enroll new unlock method (keep existing)
export async function POST(request: NextRequest) {
  try {
    const {
      deviceId,
      unlockType,
      userId,
      userType,
      password,
      passwordType,
      ticketId,
    } = await request.json();

    console.log("📥 Received enroll method request:", {
      deviceId,
      unlockType,
      userId,
      userType,
    });

    // Validate required fields
    if (!deviceId || !unlockType || !userId || userType === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: deviceId, unlockType, userId, userType",
          received: { deviceId, unlockType, userId, userType },
        },
        { status: 400 }
      );
    }

    // Validate userType
    if (userType !== 1 && userType !== 2) {
      return NextResponse.json(
        { error: "userType must be 1 (home member) or 2 (non-home member)" },
        { status: 400 }
      );
    }

    console.log("🔐 Enrolling unlock method:", {
      unlockType,
      userId,
      userType,
    });

    // Build request data
    const requestData: any = {
      unlock_type: unlockType,
      user_id: userId,
      user_type: userType,
    };

    // Add password fields if provided (for Bluetooth locks)
    if (password) {
      requestData.password = password;
      requestData.password_type = passwordType || "ticket";
      requestData.ticket_id = ticketId;
    }

    const result = await TuyaSmartLockAPI.UnlockMethod.enrollUnlockMethod(
      deviceId,
      requestData
    );

    console.log("✅ Method enrolled:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error enrolling method:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
