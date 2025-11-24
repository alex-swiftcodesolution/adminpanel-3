// lib/tuya/debug-helper.ts

export function debugApiResponse(endpoint: string, data: any) {
  console.log(`🔍 Debug ${endpoint}:`, {
    type: typeof data,
    isArray: Array.isArray(data),
    keys: typeof data === "object" ? Object.keys(data) : null,
    sample: data,
  });
}
