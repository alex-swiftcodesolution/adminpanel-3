// lib/utils/__tests__/array-helpers.test.ts

import { extractArray } from "../array-helpers";

// Test cases
console.log("Test 1 - Direct array:", extractArray([1, 2, 3])); // [1, 2, 3]
console.log("Test 2 - unlock_keys:", extractArray({ unlock_keys: [1, 2] })); // [1, 2]
console.log("Test 3 - Null:", extractArray(null)); // []
console.log("Test 4 - Undefined:", extractArray(undefined)); // []
console.log("Test 5 - String:", extractArray("test")); // []
console.log("Test 6 - Empty object:", extractArray({})); // []
