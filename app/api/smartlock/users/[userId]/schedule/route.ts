/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/users/[userId]/schedule/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params; // ✅ Await params
    const { deviceId, permanent, effectiveTime, expiredTime, scheduleDetails } =
      await request.json();

    console.log("📅 Updating user schedule:", {
      userId,
      permanent,
      effectiveTime,
      expiredTime,
      scheduleDetails,
    });

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    // ✅ Build request data
    const requestData: any = {
      permanent: permanent ?? true,
    };

    if (!permanent) {
      if (!effectiveTime || !expiredTime) {
        return NextResponse.json(
          {
            error:
              "effective_time and expired_time required when not permanent",
          },
          { status: 400 }
        );
      }
      requestData.effective_time = effectiveTime;
      requestData.expired_time = expiredTime; // ✅ Fixed typo
    }

    if (scheduleDetails && scheduleDetails.length > 0) {
      requestData.schedule_details = scheduleDetails;
    }

    const result = await TuyaSmartLockAPI.User.updateHomeUserSchedule(
      deviceId,
      userId,
      requestData
    );

    console.log("✅ Schedule updated:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Error updating schedule:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
