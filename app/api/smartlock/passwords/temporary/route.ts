/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/smartlock/passwords/temporary/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";
import { extractArray } from "@/lib/utils/array-helpers";
import { decryptTicketKey, encryptPassword } from "@/lib/utils/aes-crypto";

// Create temporary password
export async function POST(request: NextRequest) {
  try {
    const {
      deviceId,
      password,
      name,
      effectiveTime,
      invalidTime,
      phase,
      timeZone,
    } = await request.json();

    if (!deviceId || !password || !name || !effectiveTime || !invalidTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate password length (6 or 7 digits)
    if (!/^\d{6,7}$/.test(password)) {
      return NextResponse.json(
        { error: "Password must be 6 or 7 digits" },
        { status: 400 }
      );
    }

    console.log("🔐 Starting password creation flow...");

    // Step 1: Get password ticket
    console.log("📝 Step 1: Getting password ticket...");
    const ticket = await TuyaSmartLockAPI.Password.getPasswordTicket(deviceId);
    console.log("✅ Ticket received:", {
      ticket_id: ticket.ticket_id,
      expire_time: ticket.expire_time,
      ticket_key_length: ticket.ticket_key.length,
      ticket_key_preview: ticket.ticket_key.substring(0, 20) + "...",
    });

    // Step 2: Get Client Secret from environment
    // ✅ FIXED: Use TUYA_SECRET_KEY to match your .env.local
    const clientSecret = process.env.TUYA_SECRET_KEY;

    if (!clientSecret) {
      throw new Error("TUYA_SECRET_KEY environment variable is not set");
    }

    console.log("🔓 Step 2: Decrypting ticket key...");
    console.log("🔑 Client Secret details:", {
      length: clientSecret.length,
      preview:
        clientSecret.substring(0, 4) +
        "..." +
        clientSecret.substring(clientSecret.length - 4),
    });

    const decryptedKey = decryptTicketKey(ticket.ticket_key, clientSecret);
    console.log("✅ Ticket key decrypted successfully");
    console.log("🔑 Decrypted key details:", {
      length: decryptedKey.length,
      preview: decryptedKey.substring(0, 4) + "...",
    });

    // Step 3: Encrypt password with decrypted key
    console.log("🔒 Step 3: Encrypting password:", password);
    const encryptedPassword = encryptPassword(password, decryptedKey);
    console.log("✅ Password encrypted successfully");
    console.log("🔐 Encrypted password:", {
      length: encryptedPassword.length,
      value: encryptedPassword,
    });

    // Step 4: Create password with encrypted data
    console.log("📤 Step 4: Creating temporary password...");
    const result = await TuyaSmartLockAPI.Password.createTempPassword(
      deviceId,
      {
        password: encryptedPassword,
        password_type: "ticket",
        ticket_id: ticket.ticket_id,
        name,
        effective_time: effectiveTime,
        invalid_time: invalidTime,
        phone: "", // Optional
        time_zone: timeZone || "Asia/Karachi",
        type: 0, // 0: multiple use, 1: single use
        ...(phase && {
          schedule_list: [
            {
              effective_time: 0,
              invalid_time: 1439, // Full day: 23:59
              working_day: 127, // All days: 0b1111111
            },
          ],
        }),
      }
    );

    console.log("✅ Password created successfully:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ Password creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get all temporary passwords
export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const includeDeleted =
      request.nextUrl.searchParams.get("includeDeleted") === "true";

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    // ✅ Get passwords with valid=true to exclude deleted ones
    const passwords = await TuyaSmartLockAPI.Password.getTempPasswordList(
      deviceId,
      true // Only get valid passwords
    );

    const dataArray = extractArray(passwords);

    // ✅ Additional filter: Remove passwords with phase 0 (deleted) or phase 3 (to be deleted)
    // For WiFi locks:
    // phase 0 = deleted
    // phase 1 = to be sent
    // phase 2 = sent/active
    // phase 3 = to be deleted
    const filteredPasswords = includeDeleted
      ? dataArray
      : dataArray.filter((p: any) => {
          // Exclude deleted (0) and to-be-deleted (3) statuses
          return p.phase !== 0 && p.phase !== 3;
        });

    console.log("📋 Filtered passwords:", {
      total: dataArray.length,
      filtered: filteredPasswords.length,
      removed: dataArray.length - filteredPasswords.length,
    });

    return NextResponse.json({ success: true, data: filteredPasswords });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
