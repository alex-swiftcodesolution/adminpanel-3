/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/door-control/lock/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";

export async function POST(request: NextRequest) {
  try {
    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    console.log("🔒 Lock request for device:", deviceId);

    // Step 1: Get ticket
    const ticket = await TuyaSmartLockAPI.Password.getPasswordTicket(deviceId);
    console.log("🎫 Ticket obtained:", ticket.ticket_id);

    // Step 2: Lock the door (open: false)
    console.log("🚪 Locking door...");
    const result = await TuyaSmartLockAPI.DoorControl.remoteDoorOperate(
      deviceId,
      {
        ticket_id: ticket.ticket_id,
        open: false,
      }
    );

    console.log("✅ Lock result:", result);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Lock error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
