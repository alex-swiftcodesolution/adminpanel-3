/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/door-control/unlock/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";
import { decryptTicketKey, encryptPassword } from "@/lib/utils/aes-crypto";

export async function POST(request: NextRequest) {
  try {
    const { deviceId, password } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    console.log("🔓 Unlock request for device:", deviceId);
    console.log("🔑 Password provided:", !!password);

    // Step 1: Get ticket
    const ticket = await TuyaSmartLockAPI.Password.getPasswordTicket(deviceId);
    console.log("🎫 Ticket obtained:", ticket.ticket_id);

    let result;

    if (password) {
      // Step 2: Decrypt ticket_key using client secret
      const clientSecret = process.env.TUYA_ACCESS_SECRET;
      if (!clientSecret) {
        throw new Error("TUYA_ACCESS_SECRET not configured");
      }

      console.log("🔐 Decrypting ticket key...");
      const decryptedKey = decryptTicketKey(ticket.ticket_key, clientSecret);

      // Step 3: Encrypt password using decrypted key
      console.log("🔒 Encrypting password...");
      const encryptedPassword = encryptPassword(password, decryptedKey);

      // Step 4: Unlock with encrypted password
      console.log("🚪 Unlocking with password...");
      result = await TuyaSmartLockAPI.DoorControl.unlockWithPassword(deviceId, {
        password: encryptedPassword,
        password_type: "ticket",
        ticket_id: ticket.ticket_id,
      });
    } else {
      // Unlock without password
      console.log("🚪 Unlocking without password...");
      result = await TuyaSmartLockAPI.DoorControl.unlockWithoutPassword(
        deviceId,
        {
          ticket_id: ticket.ticket_id,
        }
      );
    }

    console.log("✅ Unlock result:", result);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Unlock error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
