// lib/tuya/constants.ts

// Event Type Labels for Media
export const MEDIA_EVENT_TYPES: Record<number, string> = {
  0: "Anti-pry Alert",
  1: "Remote Unlock Request",
  2: "Fingerprint Attempt",
  3: "Password Attempt",
  4: "Card Attempt",
  5: "Face Attempt",
  6: "Palm Print Attempt",
  7: "Finger Vein Attempt",
  8: "Fingerprint Unlock",
  9: "Password Unlock",
  10: "Card Unlock",
  11: "Face Unlock",
  12: "Palm Print Unlock",
  13: "Finger Vein Unlock",
  14: "Temp Password Unlock",
  15: "Dynamic Password Unlock",
  16: "Remote Unlock",
  17: "Temp Password Report",
  18: "Doorbell",
  19: "Duress Alert",
  20: "Low Battery Alert",
  21: "Key Insertion Alert",
  22: "High Temperature Alert",
  23: "Doorbell + Remote Unlock",
  24: "Loitering Detected",
  25: "Lock Broken",
  26: "Special Fingerprint Unlock",
  27: "Arming Mode Unlock",
  28: "Remote Control Unlock",
};

// Unlock Type Labels
export const UNLOCK_TYPE_MAP: Record<string, string> = {
  unlock_fingerprint: "Fingerprint",
  unlock_password: "Password",
  unlock_temporary: "Temporary Password",
  unlock_dynamic: "Dynamic Password",
  unlock_card: "Card",
  unlock_face: "Face Recognition",
  unlock_key: "Mechanical Key",
  unlock_app: "App Remote",
  unlock_identity_card: "Identity Card",
  unlock_emergency: "Emergency Password",
};

// Alarm Type Labels
export const ALARM_TYPE_MAP: Record<
  string,
  { name: string; severity: "high" | "medium" | "low" }
> = {
  hijack: { name: "Duress Alarm", severity: "high" },
  alarm_lock: { name: "Lock Alarm", severity: "medium" },
  doorbell: { name: "Doorbell", severity: "low" },
};

// Alarm Value Messages
export const ALARM_VALUE_MAP: Record<string, string> = {
  wrong_finger: "Wrong fingerprint attempt",
  wrong_password: "Wrong password attempt",
  wrong_card: "Wrong card attempt",
  wrong_face: "Wrong face attempt",
  low_battery: "Low battery warning",
  door_unclosed: "Door not closed properly",
  multiple_fail: "Multiple unlock failures",
  forced_lock: "Forced lock attempt",
  pry: "Pry attempt detected",
};
