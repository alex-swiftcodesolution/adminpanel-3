/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/unlock-methods/[unlockSn]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

// ✅ READ - Get single unlock method (if needed)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ unlockSn: string }> }
) {
  try {
    const { unlockSn } = await params;
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const userId = request.nextUrl.searchParams.get("userId");

    if (!deviceId || !userId) {
      return NextResponse.json(
        { error: "Device ID and User ID are required" },
        { status: 400 }
      );
    }

    // Get detailed methods for user and find specific one
    const result =
      await TuyaSmartLockAPI.UnlockMethod.getDetailedUserUnlockMethods(
        deviceId,
        userId
      );

    const method = result.records.find(
      (m: any) => m.unlock_sn === parseInt(unlockSn)
    );

    if (!method) {
      return NextResponse.json(
        { error: "Unlock method not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: method });
  } catch (error: any) {
    console.error("❌ Error fetching unlock method:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ UPDATE - Update unlock method
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ unlockSn: string }> }
) {
  try {
    const { unlockSn } = await params;
    const { deviceId, dpCode, unlockName, unlockAttr, notifyInfo } =
      await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (dpCode !== undefined) updateData.dp_code = dpCode;
    if (unlockName !== undefined) updateData.unlock_name = unlockName;
    if (unlockAttr !== undefined) updateData.unlock_attr = unlockAttr;
    if (notifyInfo !== undefined) updateData.notify_info = notifyInfo;

    console.log("📝 Updating unlock method:", { unlockSn, updateData });

    const result = await TuyaSmartLockAPI.UnlockMethod.updateUnlockMethod(
      deviceId,
      parseInt(unlockSn),
      updateData
    );

    console.log("✅ Method updated:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error updating method:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Delete unlock method
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ unlockSn: string }> }
) {
  try {
    const { unlockSn } = await params;
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const userType = request.nextUrl.searchParams.get("userType");
    const userId = request.nextUrl.searchParams.get("userId");
    const unlockType = request.nextUrl.searchParams.get("unlockType");
    let unlockNo = request.nextUrl.searchParams.get("unlockNo");

    // ✅ If unlockNo is not provided or is invalid, use unlockSn
    if (!unlockNo || unlockNo === "undefined" || unlockNo === "null") {
      unlockNo = unlockSn;
    }

    if (!deviceId || !userType || !userId || !unlockType || !unlockNo) {
      console.error("❌ Missing parameters:", {
        deviceId,
        userType,
        userId,
        unlockType,
        unlockNo,
        unlockSn,
      });
      return NextResponse.json(
        {
          error:
            "Missing required parameters: deviceId, userType, userId, unlockType, unlockNo",
        },
        { status: 400 }
      );
    }

    console.log("🗑️ Deleting unlock method:", {
      deviceId,
      userType,
      userId,
      unlockType,
      unlockNo,
    });

    const result = await TuyaSmartLockAPI.UnlockMethod.deleteUnlockMethod(
      deviceId,
      parseInt(userType),
      userId,
      unlockType,
      parseInt(unlockNo)
    );

    console.log("✅ Method deleted:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error deleting method:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
