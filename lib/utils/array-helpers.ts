// lib/utils/array-helpers.ts

/**
 * Extracts array from various Tuya API response formats
 */
export function extractArray<T>(value: any, fallback: T[] = []): T[] {
  // Already an array
  if (Array.isArray(value)) {
    return value;
  }

  // Null or undefined
  if (value === null || value === undefined) {
    return fallback;
  }

  // Object with nested array - check common property names
  if (typeof value === "object") {
    const commonKeys = [
      "logs",
      "unlock_keys",
      "unlock_logs",
      "alarm_logs",
      "temp_passwords",
      "users",
      "data",
      "list",
      "result",
      "results",
      "items",
      "records",
    ];

    for (const key of commonKeys) {
      if (Array.isArray(value[key])) {
        return value[key];
      }
    }
  }

  // Can't extract array
  console.warn("Could not extract array from:", value);
  return fallback;
}

/**
 * Ensures the value is an array
 */
export function ensureArray<T>(value: any): T[] {
  return extractArray<T>(value, []);
}

/**
 * Safely get array length
 */
export function getArrayLength(data: any): number {
  const arr = ensureArray(data);
  return arr.length;
}
