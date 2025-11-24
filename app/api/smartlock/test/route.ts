// app/api/smartlock/test/route.ts

import { NextRequest, NextResponse } from "next/server";
import { tuyaContext } from "@/lib/tuya/tuya-connector";

export async function GET(request: NextRequest) {
  try {
    const uid = process.env.TUYA_APP_ACCOUNT_UID;

    // Test 1: Check environment variables
    const envCheck = {
      hasAccessId: !!process.env.TUYA_ACCESS_ID,
      hasSecretKey: !!process.env.TUYA_SECRET_KEY,
      hasBaseUrl: !!process.env.TUYA_BASE_URL,
      hasUid: !!process.env.TUYA_APP_ACCOUNT_UID,
      baseUrl: process.env.TUYA_BASE_URL,
      uid: uid,
    };

    // Test 2: Try to get token
    let tokenTest = { success: false, error: "" };
    try {
      const token = await tuyaContext["tokenManager"].getAccessToken();
      tokenTest = { success: !!token, error: "" };
    } catch (error: any) {
      tokenTest = { success: false, error: error.message };
    }

    // Test 3: Try to fetch devices
    let deviceTest = { success: false, error: "", count: 0 };
    if (uid) {
      try {
        const response = await tuyaContext.request({
          method: "GET",
          path: `/v1.0/users/${uid}/devices`,
          body: {},
        });
        deviceTest = {
          success: response.success,
          error: response.success ? "" : response.msg,
          count: response.result?.length || 0,
        };
      } catch (error: any) {
        deviceTest = { success: false, error: error.message, count: 0 };
      }
    }

    return NextResponse.json({
      success: true,
      tests: {
        environment: envCheck,
        authentication: tokenTest,
        deviceAccess: deviceTest,
      },
      message: "API connection test completed",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
