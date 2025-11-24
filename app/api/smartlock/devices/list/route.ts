// app/api/smartlock/devices/list/route.ts

import { NextRequest, NextResponse } from "next/server";
import { tuyaContext } from "@/lib/tuya/tuya-connector";
import { extractArray } from "@/lib/utils/array-helpers";

export async function GET(request: NextRequest) {
  try {
    const uid =
      request.nextUrl.searchParams.get("uid") ||
      process.env.TUYA_APP_ACCOUNT_UID;

    if (!uid) {
      return NextResponse.json(
        {
          error: "User ID is required. Set TUYA_APP_ACCOUNT_UID in .env.local",
        },
        { status: 400 }
      );
    }

    // Get devices for the user
    const response = await tuyaContext.request({
      method: "GET",
      path: `/v1.0/users/${uid}/devices`,
      body: {},
    });

    if (!response.success) {
      throw new Error(response.msg || "Failed to fetch devices");
    }

    const dataArray = extractArray(response);
    console.log(dataArray);

    return NextResponse.json({ success: true, data: dataArray });
  } catch (error: any) {
    console.error("Error fetching devices:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
