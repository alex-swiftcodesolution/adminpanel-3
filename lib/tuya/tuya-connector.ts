// /* eslint-disable @typescript-eslint/no-explicit-any */
// // lib/tuya/tuya-connector.ts

// import { TuyaContext } from "@tuya/tuya-connector-nodejs";

// // Tuya connector configuration
// const tuyaConfig = {
//   baseUrl: process.env.TUYA_BASE_URL || "https://openapi.tuyaeu.com",
//   accessKey: process.env.TUYA_ACCESS_ID || "",
//   secretKey: process.env.TUYA_SECRET_KEY || "",
// };

// // Validate required environment variables
// if (!tuyaConfig.accessKey || !tuyaConfig.secretKey) {
//   console.error("❌ Missing Tuya credentials!");
//   console.error("Please set TUYA_ACCESS_ID and TUYA_SECRET_KEY in .env.local");
//   throw new Error(
//     "Missing required Tuya credentials. Please check your environment variables."
//   );
// }

// console.log("✅ Tuya connector initialized");
// console.log("📍 Base URL:", tuyaConfig.baseUrl);
// console.log("🔑 Access ID:", tuyaConfig.accessKey.substring(0, 8) + "...");

// // Create and export Tuya context instance
// export const tuyaContext = new TuyaContext(tuyaConfig);

// // Export config for testing purposes
// export const config = tuyaConfig;

// // Helper function to make authenticated requests
// export async function tuyaRequest<T = any>(options: {
//   method: "GET" | "POST" | "PUT" | "DELETE";
//   path: string;
//   body?: any;
//   query?: Record<string, any>;
// }): Promise<T> {
//   try {
//     console.log(`🔄 Tuya API Request: ${options.method} ${options.path}`);

//     const response = await tuyaContext.request({
//       method: options.method,
//       path: options.path,
//       body: options.body || {},
//     });

//     console.log(`✅ Tuya API Response: ${options.method} ${options.path}`, {
//       success: response.success,
//       code: response.code,
//     });

//     if (!response.success) {
//       const errorMsg = response.msg || "Tuya API request failed";
//       console.error(`❌ Tuya API Error: ${options.method} ${options.path}`, {
//         code: response.code,
//         msg: response.msg,
//       });
//       throw new Error(errorMsg);
//     }

//     return response.result as T;
//   } catch (error: any) {
//     console.error("❌ Tuya API Error:", {
//       path: options.path,
//       method: options.method,
//       error: error.message,
//     });
//     throw error;
//   }
// }

// export default tuyaContext;

/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/tuya/tuya-connector.ts

import { TuyaContext } from "@tuya/tuya-connector-nodejs";

// Tuya connector configuration
const tuyaConfig = {
  baseUrl: process.env.TUYA_BASE_URL || "https://openapi.tuyaeu.com",
  accessKey: process.env.TUYA_ACCESS_ID || "",
  secretKey: process.env.TUYA_SECRET_KEY || "",
};

// Validate required environment variables
if (!tuyaConfig.accessKey || !tuyaConfig.secretKey) {
  console.error("❌ Missing Tuya credentials!");
  console.error("Please set TUYA_ACCESS_ID and TUYA_SECRET_KEY in .env.local");
  throw new Error(
    "Missing required Tuya credentials. Please check your environment variables."
  );
}

console.log("✅ Tuya connector initialized");
console.log("📍 Base URL:", tuyaConfig.baseUrl);
console.log("🔑 Access ID:", tuyaConfig.accessKey.substring(0, 8) + "...");

// Create and export Tuya context instance
export const tuyaContext = new TuyaContext(tuyaConfig);

// Export config for testing purposes
export const config = tuyaConfig;

// Helper function to make authenticated requests
export async function tuyaRequest<T = any>(options: {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: any;
  query?: Record<string, any>;
}): Promise<T> {
  try {
    // ✅ BUILD FULL PATH WITH QUERY PARAMETERS
    let fullPath = options.path;
    if (options.query && Object.keys(options.query).length > 0) {
      const params = new URLSearchParams();
      Object.entries(options.query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        fullPath = `${options.path}?${queryString}`;
      }
    }

    console.log(`🔄 Tuya API Request: ${options.method} ${fullPath}`);

    const response = await tuyaContext.request({
      method: options.method,
      path: fullPath, // ✅ Use full path with query params
      body: options.body || {},
    });

    console.log(`✅ Tuya API Response: ${options.method} ${fullPath}`, {
      success: response.success,
      code: response.code,
    });

    if (!response.success) {
      const errorMsg = response.msg || "Tuya API request failed";
      console.error(`❌ Tuya API Error: ${options.method} ${fullPath}`, {
        code: response.code,
        msg: response.msg,
      });
      throw new Error(errorMsg);
    }

    return response.result as T;
  } catch (error: any) {
    console.error("❌ Tuya API Error:", {
      path: options.path,
      method: options.method,
      error: error.message,
    });
    throw error;
  }
}

export default tuyaContext;
