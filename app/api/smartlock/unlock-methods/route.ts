// app/api/smartlock/unlock-methods/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TuyaSmartLockAPI } from "@/lib/tuya/tuya-api-wrapper";
import { debugApiResponse } from "@/lib/tuya/debug-helper";
import { extractArray } from "@/lib/utils/array-helpers";

// Get unassigned unlock methods
export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    const userId = request.nextUrl.searchParams.get("userId");

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 }
      );
    }

    let methods;
    if (userId) {
      methods = await TuyaSmartLockAPI.UnlockMethod.getUserUnlockMethods(
        deviceId,
        userId
      );
    } else {
      methods = await TuyaSmartLockAPI.UnlockMethod.getUnassignedKeys(deviceId);
    }

    // Debug the response
    debugApiResponse("/unlock-methods", methods);

    // Extract the actual array from the response
    // Tuya API returns { unlock_keys: [...] } instead of a direct array
    let methodsArray = [];
    if (Array.isArray(methods)) {
      methodsArray = methods;
    } else if (methods && typeof methods === "object") {
      // Check for common array property names
      methodsArray =
        methods.unlock_keys ||
        methods.data ||
        methods.list ||
        methods.result ||
        [];
    }

    const dataArray = extractArray(methodsArray);
    console.log(dataArray);

    return NextResponse.json({ success: true, data: dataArray });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, data: [] },
      { status: 200 } // Return 200 to prevent UI errors
    );
  }
}
