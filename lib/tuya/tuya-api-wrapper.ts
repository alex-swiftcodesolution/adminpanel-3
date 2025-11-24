/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/tuya/tuya-api-wrapper.ts

import { extractArray } from "../utils/array-helpers";
import { tuyaRequest } from "./tuya-connector";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TuyaResponse<T = any> {
  success: boolean;
  result: T;
  t: number;
  tid: string;
}

// Password Types
export interface TemporaryPassword {
  id: number; // Changed from string to number
  name: string;
  password?: string;
  effective_time: number;
  invalid_time: number;
  phase?: number;
  phone?: string;
  sn?: number; // Added
  time_zone?: string; // Added
  type?: number; // Added
  status?: number; // Added
}

export interface OfflinePassword {
  id: string;
  name?: string;
  password: string;
  effective_time: number;
  invalid_time: number;
}

export interface DynamicPassword {
  password: string;
  effective_time: number;
  invalid_time: number;
}

export interface PasswordTicket {
  ticket_id: string;
  ticket_key: string;
  expire_time: string;
}

// User Types
export interface DeviceUser {
  user_id: string;
  device_id: string;
  nick_name: string; // ✅ FIXED: was user_name
  sex: 0 | 1 | 2; // ✅ FIXED: was user_type (0=unknown, 1=male, 2=female)
  contact: string; // ✅ Phone or email
  birthday?: number; // ✅ Timestamp
  height: number; // ✅ cm
  weight: number; // ✅ grams (divide by 1000 for kg)
}

// ✅ NEW: Smart Lock User Interface (includes unlock methods)
export interface SmartLockUser {
  user_id: string;
  avatar_url?: string;
  user_contact: string;
  unlock_detail?: Array<{
    dp_code: string;
    unlock_list: Array<{
      unlock_id: string;
      unlock_sn: number;
      unlock_name: string;
      unlock_attr: number;
      op_mode_id: number;
      photo_unlock: boolean;
      admin: boolean;
    }>;
    count: number;
  }>;
  user_type: number; // 10=admin, 20=member, 50=owner
  nick_name: string;
  lock_user_id: number;
  back_home_notify_attr: number;
  effective_flag: number;
  time_schedule_info?: {
    permanent: boolean;
    effective_time: number;
    expired_time: number;
    operate: string;
    delivery_status: string;
    schedule_details?: Array<{
      start_minute: number;
      end_minute: number;
      working_day: number;
      time_zone_id: string;
      all_day: boolean;
    }>;
  };
  uid: string;
}

export interface HomeUser extends DeviceUser {
  effective_time?: number;
  invalid_time?: number;
  schedule?: string;
}

// Unlock Method Types
export interface UnlockKey {
  unlock_no: number; // The ID/slot number
  unlock_type: string; // "password" | "fingerprint" | "card" | "remoteControl"
  hijack?: boolean; // Duress alarm enabled (optional)
}

export interface DetailedUnlockMethod {
  user_name: string;
  user_type: number; // 0=unknown, 10=admin, 20=member, 40=shared, 50=super admin
  user_id: string;
  lock_user_id: number;
  unlock_name: string;
  dp_code: string; // "unlock_fingerprint", "unlock_password", etc.
  unlock_sn: number;
  unlock_attr: number; // 1=duress attribute
  phase?: number; // Status (1=confirmed, 2=to be confirmed, etc.)
  voice_attr: number; // 0=cannot unlock by voice, 1=can unlock by voice
  operate?: string; // "CREATE", "MODIFY", "DELETE"
  delivery_status?: string; // "ONGOING", "SUCCESS", "FAILED"
  allocate_flag: number; // 1=never allocated (can unbind), 0=allocated
  channel_id: number;
  notify_info?: {
    app_send: boolean;
    voice_phone?: string;
    owner_id?: string;
  };
}

// History/Log Types
export interface UnlockRecord {
  id: string;
  unlock_id: number;
  unlock_type: number;
  unlock_name: string;
  time: number;
  user_id?: string;
  user_name?: string;
  media_url?: string;
}

export interface AlarmRecord {
  id: string;
  alarm_type: number;
  alarm_message: string;
  time: number;
  media_url?: string;
}

export interface CombinedRecord {
  id: string;
  record_type: "unlock" | "alarm";
  data: UnlockRecord | AlarmRecord;
  time: number;
}

// Media Types
export interface MediaInfo {
  url: string;
  type: "image" | "video";
  time: number;
}

export interface Album {
  album_id: string;
  device_id: string;
  media_list: MediaInfo[];
  time: number;
}

// Remote Unlock Types
export interface RemoteUnlockMethod {
  remote_unlock_type: "remoteUnlockWithoutPwd" | "remoteUnlockWithPwd";
  open: boolean;
  device_id: string;
}

// Device Info
export interface DeviceInfo {
  id: string;
  name: string;
  local_key: string;
  category: string;
  product_id: string;
  sub: boolean;
  uuid: string;
  online: boolean;
  status: any[];
}

// ============================================================================
// 1. PASSWORD MANAGEMENT APIs
// ============================================================================

export class PasswordAPI {
  /**
   * Get a temporary encryption key for password encryption
   */
  static async getPasswordTicket(deviceId: string): Promise<PasswordTicket> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/door-lock/password-ticket`,
    });
  }

  /**
   * Get a temporary encryption key (smart-lock endpoint)
   */
  static async getPasswordTicketSmartLock(
    deviceId: string
  ): Promise<PasswordTicket> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/smart-lock/devices/${deviceId}/password-ticket`,
    });
  }

  /**
   * Create a temporary password (with name, supports periodic password)
   */
  static async createTempPassword(
    deviceId: string,
    data: {
      password: string; // Encrypted password
      password_type: "ticket";
      ticket_id: string;
      name: string;
      effective_time: number;
      invalid_time: number;
      phone?: string;
      time_zone?: string;
      type?: number; // 0: multiple use, 1: single use
      schedule_list?: Array<{
        effective_time: number; // Minutes from 00:00
        invalid_time: number; // Minutes from 00:00
        working_day: number; // Bitmap: bit0-bit6 = Sun-Sat
      }>;
    }
  ): Promise<{ id: number }> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/door-lock/temp-password`,
      body: data,
    });
  }

  /**
   * Create an unnamed temporary password (v2.0)
   */
  static async createUnnamedTempPassword(
    deviceId: string,
    data: {
      password: string;
      effective_time: number;
      invalid_time: number;
      phase?: number;
    }
  ): Promise<TemporaryPassword> {
    return tuyaRequest({
      method: "POST",
      path: `/v2.0/devices/${deviceId}/door-lock/temp-password`,
      body: data,
    });
  }

  /**
   * Get information about a specific temporary password
   */
  static async getTempPassword(
    deviceId: string,
    passwordId: string
  ): Promise<TemporaryPassword> {
    return tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/temp-password/${passwordId}`,
    });
  }

  /**
   * Get list of all temporary passwords
   * @param onlyValid
   */
  static async getTempPasswordList(
    deviceId: string,
    onlyValid: boolean = true // ✅ Default to only valid passwords
  ): Promise<TemporaryPassword[]> {
    const result = await tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/temp-passwords`,
      query: onlyValid ? { valid: true } : undefined, // ✅ Add valid parameter
    });

    return extractArray<TemporaryPassword>(result);
  }

  /**
   * Get list of keepalive temporary passwords
   */
  static async getStandbyTempPasswords(
    deviceId: string
  ): Promise<TemporaryPassword[]> {
    return tuyaRequest({
      method: "GET",
      path: `/v1.0/smart-lock/devices/${deviceId}/standby-lock-temp-passwords`,
    });
  }

  /**
   * Modify a temporary password
   */
  static async modifyTempPassword(
    deviceId: string,
    passwordId: string,
    data: {
      password?: string;
      name?: string;
      effective_time?: number;
      invalid_time?: number;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/temp-passwords/${passwordId}/modify-password`,
      body: data,
    });
  }

  /**
   * Freeze a temporary password
   */
  static async freezeTempPassword(
    deviceId: string,
    passwordId: string
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/temp-passwords/${passwordId}/freeze-password`,
    });
  }

  /**
   * Unfreeze a temporary password
   */
  static async unfreezeTempPassword(
    deviceId: string,
    passwordId: string
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/temp-passwords/${passwordId}/unfreeze-password`,
    });
  }

  /**
   * Delete a temporary password
   */
  static async deleteTempPassword(
    deviceId: string,
    passwordId: string
  ): Promise<boolean> {
    return tuyaRequest({
      method: "DELETE",
      path: `/v1.0/devices/${deviceId}/door-lock/temp-passwords/${passwordId}`,
    });
  }

  /**
   * Clear all temporary passwords
   */
  static async clearAllTempPasswords(deviceId: string): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/door-lock/temp-passwords/rest-password`,
    });
  }

  /**
   * Get an offline password
   */
  static async getOfflinePassword(
    deviceId: string,
    data: {
      effective_time: number;
      invalid_time: number;
    }
  ): Promise<OfflinePassword> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/door-lock/offline-temp-password`,
      body: data,
    });
  }

  /**
   * Get an offline password v1.1
   */
  static async getOfflinePasswordV11(
    deviceId: string,
    data: {
      effective_time: number;
      invalid_time: number;
    }
  ): Promise<OfflinePassword> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.1/devices/${deviceId}/door-lock/offline-temp-password`,
      body: data,
    });
  }

  /**
   * Update the name of an offline password
   */
  static async updateOfflinePasswordName(
    deviceId: string,
    passwordId: string,
    name: string
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/offline-temp-password/${passwordId}`,
      body: { name },
    });
  }

  /**
   * Get a dynamic password (valid for 5 minutes)
   */
  static async getDynamicPassword(deviceId: string): Promise<DynamicPassword> {
    return tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/dynamic-password`,
    });
  }

  /**
   * Set an advanced password
   */
  static async setAdvancedPassword(
    deviceId: string,
    data: {
      password: string;
      type: number;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/door-lock/advanced-password`,
      body: data,
    });
  }

  /**
   * Query advanced password
   */
  static async getAdvancedPassword(deviceId: string): Promise<any> {
    return tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/advanced-password`,
    });
  }

  /**
   * Synchronize passwords
   */
  static async syncPasswords(
    deviceId: string,
    data: {
      passwords: any[];
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/door-lock/issue-password`,
      body: data,
    });
  }
}

// ============================================================================
// 2. USER MANAGEMENT APIs
// ============================================================================

export class UserAPI {
  /**
   * Create a device user (member)
   * After creating, user needs to enroll fingerprint/card/password on the physical lock
   */
  static async createDeviceUser(
    deviceId: string,
    data: {
      nick_name: string; // ✅ FIXED: was user_name
      sex: 1 | 2; // ✅ FIXED: was user_type (1=male, 2=female)
      contact?: string; // ✅ Optional: phone or email
      birthday?: number; // ✅ Optional: timestamp
      height?: number; // ✅ Optional: cm
      weight?: number; // ✅ Optional: grams (not kg!)
    }
  ): Promise<{ user_id: string }> {
    // ✅ Returns user_id only
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/user`,
      body: data,
    });
  }

  /**
   * Modify a device user
   */
  static async modifyDeviceUser(
    deviceId: string,
    userId: string,
    data: {
      nick_name?: string; // ✅ FIXED: was user_name
      sex?: 1 | 2; // ✅ FIXED: added sex (1=male, 2=female)
      contact?: string; // ✅ ADDED
      birthday?: number; // ✅ ADDED
      height?: number; // ✅ ADDED
      weight?: number; // ✅ ADDED
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/users/${userId}`,
      body: data,
    });
  }

  /**
   * Update the role of a smart lock user
   * NOTE: This is for smart lock users, different from device members
   */
  static async updateUserRole(
    deviceId: string,
    userId: string,
    role: "admin" | "normal" // ✅ FIXED: was number, should be string
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/smart-lock/devices/${deviceId}/users/${userId}/actions/role`,
      body: { role },
    });
  }

  /**
   * Delete a device user
   */
  static async deleteDeviceUser(
    deviceId: string,
    userId: string
  ): Promise<boolean> {
    return tuyaRequest({
      method: "DELETE",
      path: `/v1.0/devices/${deviceId}/users/${userId}`,
    });
  }

  /**
   * Query information about a device user
   */
  static async getDeviceUser(
    deviceId: string,
    userId: string
  ): Promise<DeviceUser> {
    return tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/users/${userId}`,
    });
  }

  /**
   * Query information about a device user (v1.1)
   */
  static async getDeviceUserV11(
    deviceId: string,
    userId: string
  ): Promise<DeviceUser> {
    return tuyaRequest({
      method: "GET",
      path: `/v1.1/devices/${deviceId}/users/${userId}`,
    });
  }

  /**
   * Query list of users by device ID
   */
  static async getDeviceUsers(deviceId: string): Promise<DeviceUser[]> {
    const result = await tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/users`,
    });

    return extractArray<DeviceUser>(result);
  }

  /**
   * Query list of users by device ID (v1.1) with pagination
   */
  static async getDeviceUsersV11Paginated(
    deviceId: string,
    options: {
      keyword?: string;
      role?: "admin" | "normal" | "";
      page_no?: number;
      page_size?: number;
    } = {}
  ): Promise<{
    has_more: boolean;
    total_pages: number;
    total: number;
    records: DeviceUser[];
  }> {
    const { keyword = "", role = "", page_no = 1, page_size = 20 } = options;

    return tuyaRequest({
      method: "GET",
      path: `/v1.1/devices/${deviceId}/users`,
      query: {
        keyword,
        role,
        page_no,
        page_size,
      },
    });
  }

  /**
   * Get list of smart lock users with unlocking methods
   * This is different from device members - includes unlock method details
   */
  static async getSmartLockUsers(
    deviceId: string,
    options: {
      codes?: string[];
      page_no?: number;
      page_size?: number;
    } = {}
  ): Promise<{
    total: number;
    total_pages: number;
    has_more: boolean;
    records: SmartLockUser[];
  }> {
    const {
      codes = [
        "unlock_fingerprint",
        "unlock_password",
        "unlock_card",
        "unlock_face",
      ],
      page_no = 1,
      page_size = 20,
    } = options;

    return tuyaRequest({
      method: "GET",
      path: `/v1.0/smart-lock/devices/${deviceId}/users`,
      query: {
        codes: codes.join(","),
        page_no,
        page_size,
      },
    });
  }

  /**
   * Update the validity period of a smart lock user
   */
  static async updateHomeUserSchedule(
    deviceId: string,
    userId: string,
    data: {
      permanent?: boolean;
      effective_time?: number;
      expired_time?: number;
      schedule_details?: Array<{
        start_minute?: number;
        end_minute?: number;
        working_day?: number;
        time_zone_id?: string;
        all_day?: boolean;
      }>;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/smart-lock/devices/${deviceId}/users/${userId}/schedule`,
      body: data,
    });
  }

  /**
   * Get devices linked with a user account
   */
  static async getUserDevices(uid: string): Promise<string[]> {
    return tuyaRequest({
      method: "GET",
      path: `/v1.0/smart-lock/users/${uid}/devices`,
    });
  }

  /**
   * Get list of removed users
   */
  static async getAbsentUsers(deviceId: string): Promise<DeviceUser[]> {
    return tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/absent-users`,
    });
  }

  /**
   * Delete smart lock user information
   */
  static async deleteUsersInfo(
    deviceId: string,
    userIds: string[]
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/smart-lock/devices/${deviceId}/users/${userIds.join(
        ","
      )}/actions/delete-users-issue`,
    });
  }

  /**
   * Assign a password to a device user
   */
  static async assignPasswordToUser(
    deviceId: string,
    userId: string,
    data: {
      password_id: string;
      password_type: number;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/device-lock/users/${userId}/allocate`,
      body: data,
    });
  }

  /**
   * Get user unlock methods
   */
  static async getUserUnlockMethods(
    deviceId: string,
    userId: string,
    options: {
      codes?: string[];
      unlock_name?: string;
      page_no?: number;
      page_size?: number;
    } = {}
  ): Promise<{
    total: number;
    total_pages: number;
    has_more: boolean;
    records: Array<{
      user_name: string;
      user_type: number;
      user_id: string;
      lock_user_id: number;
      unlock_name: string;
      dp_code: string;
      unlock_sn: number;
      unlock_attr: number;
      phase: number;
      voice_attr: number;
      operate: string;
      delivery_status: string;
      allocate_flag: number;
      channel_id: number;
    }>;
  }> {
    const {
      codes = [],
      unlock_name = "",
      page_no = 1,
      page_size = 20,
    } = options;

    return tuyaRequest({
      method: "GET",
      path: `/v1.0/smart-lock/devices/${deviceId}/opmodes/${userId}`,
      query: {
        codes: codes.join(","),
        unlock_name,
        page_no,
        page_size,
      },
    });
  }
}

// ============================================================================
// 3. UNLOCKING METHOD MANAGEMENT APIs
// ============================================================================

export class UnlockMethodAPI {
  /**
   * ✅ Get list of unlocking methods NOT assigned to any user
   * Documentation: GET /v1.0/devices/{device_id}/door-lock/unassigned-keys
   *
   * @param deviceId - The device ID
   * @param unlockType - Optional filter: "fingerprint" | "password" | "card" | "remoteControl"
   * @returns Array of UnlockKey objects
   */
  static async getUnassignedKeys(
    deviceId: string,
    unlockType?: string
  ): Promise<UnlockKey[]> {
    const result = await tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/unassigned-keys`,
      query: unlockType ? { unlock_type: unlockType } : undefined,
    });

    // Response format: { unlock_keys: [...] }
    return extractArray<UnlockKey>(result);
  }

  /**
   * ✅ Get list of unlocking methods assigned to a specific user
   * Documentation: GET /v1.0/devices/{device_id}/door-lock/user-types/{user_type}/users/{user_id}/assigned-keys
   *
   * @param deviceId - The device ID
   * @param userType - 1 (home member) or 2 (non-home member)
   * @param userId - The user ID
   * @param unlockType - Optional filter: "fingerprint" | "password" | "card"
   * @returns Array of UnlockKey objects
   */
  static async getAssignedKeys(
    deviceId: string,
    userType: number,
    userId: string,
    unlockType?: string
  ): Promise<UnlockKey[]> {
    const result = await tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/user-types/${userType}/users/${userId}/assigned-keys`,
      query: unlockType ? { unlock_type: unlockType } : undefined,
    });

    // Response format: { unlock_keys: [...] }
    return extractArray<UnlockKey>(result);
  }

  /**
   * ✅ Enroll new unlocking method for a user
   * Documentation: PUT /v1.0/devices/{device_id}/door-lock/actions/entry
   */
  static async enrollUnlockMethod(
    deviceId: string,
    data: {
      unlock_type: string; // "fingerprint" | "password" | "card" | "face" | "remoteControl"
      user_type: number; // 1 or 2
      user_id: string;
      password?: string; // For Bluetooth locks with password type
      password_type?: string; // "ticket"
      ticket_id?: string; // From getPasswordTicket()
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/actions/entry`,
      body: data,
    });
  }

  /**
   * ✅ Delete an unlocking method
   * Documentation: DELETE /v1.0/devices/{device_id}/door-lock/user-types/{user_type}/users/{user_id}/unlock-types/{unlock_type}/keys/{unlock_no}
   */
  static async deleteUnlockMethod(
    deviceId: string,
    userType: number,
    userId: string,
    unlockType: string, // Changed from number to string
    unlockNo: number
  ): Promise<boolean> {
    return tuyaRequest({
      method: "DELETE",
      path: `/v1.0/devices/${deviceId}/door-lock/user-types/${userType}/users/${userId}/unlock-types/${unlockType}/keys/${unlockNo}`,
    });
  }

  /**
   * ✅ Cancel enrollment of unlocking method
   * Documentation: PUT /v1.0/devices/{device_id}/door-lock/unlock-types/{unlock_type}/actions/cancel
   */
  static async cancelEnrollment(
    deviceId: string,
    unlockType: string // Changed from number to string
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/unlock-types/${unlockType}/actions/cancel`,
    });
  }

  /**
   * ✅ Synchronize unlocking methods from device to cloud
   * Documentation: POST /v1.0/smart-lock/devices/{device_id}/opmodes/actions/sync
   */
  static async syncUnlockMethods(
    deviceId: string,
    codes?: string[]
  ): Promise<boolean> {
    const defaultCodes = [
      "unlock_fingerprint",
      "unlock_card",
      "unlock_password",
      "unlock_face",
      "unlock_hand",
      "unlock_finger_vein",
      "unlock_telecontrol_kit",
    ];

    const codesString = (codes || defaultCodes).join(",");

    console.log("🔄 Syncing with codes:", codesString);

    return tuyaRequest({
      method: "POST",
      path: `/v1.0/smart-lock/devices/${deviceId}/opmodes/actions/sync`,
      body: { codes: codesString }, // ✅ Changed from query to body
    });
  }

  /**
   * ✅ Assign unlocking methods to a user
   * Documentation: POST /v1.0/devices/{device_id}/door-lock/opmodes/actions/allocate
   */
  static async assignUnlockMethods(
    deviceId: string,
    data: {
      user_id: string;
      unlock_list: Array<{
        dp_code: string; // "unlock_password", "unlock_fingerprint", etc.
        unlock_sn: number;
      }>;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/door-lock/opmodes/actions/allocate`,
      body: data,
    });
  }

  /**
   * ✅ Unbind unlock methods from a user
   * Documentation: POST /v1.0/smart-lock/devices/{device_id}/opmodes/actions/cancel-allocate
   */
  static async unbindUnlockMethods(
    deviceId: string,
    data: {
      user_id: string;
      unlock_list: Array<{
        code: string; // "unlock_fingerprint", "unlock_password", etc.
        unlock_sn: number;
      }>;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/smart-lock/devices/${deviceId}/opmodes/actions/cancel-allocate`,
      body: data,
    });
  }

  /**
   * ✅ Update unlock method details
   * Documentation: PUT /v1.0/devices/{device_id}/door-lock/opmodes/{unlock_sn}
   */
  static async updateUnlockMethod(
    deviceId: string,
    unlockSn: number,
    data: {
      dp_code?: string;
      unlock_name?: string;
      unlock_attr?: number; // 1 = special/duress
      notify_info?: {
        app_send: boolean; // 0 or 1
      };
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/opmodes/${unlockSn}`,
      body: data,
    });
  }

  /**
   * ✅ Set special attributes (photo capturing, voice)
   * Documentation: POST /v1.0/smart-lock/devices/{device_id}/opmodes/{opmode_id}/attribute/{attribute}/opmode-attr
   */
  static async setUnlockMethodAttribute(
    deviceId: string,
    opmodeId: number,
    attribute: 1 | 2, // 1=voice, 2=photo capturing
    enabled: boolean
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/smart-lock/devices/${deviceId}/opmodes/${opmodeId}/attribute/${attribute}/opmode-attr`,
      body: { enabled },
    });
  }

  /**
   * ✅ Get detailed unlock methods for a user
   * Documentation: GET /v1.0/smart-lock/devices/{device_id}/opmodes/{user_id}
   */
  static async getDetailedUserUnlockMethods(
    deviceId: string,
    userId: string,
    options: {
      codes?: string[];
      unlock_name?: string;
      page_no?: number;
      page_size?: number;
    } = {}
  ): Promise<{
    total: number;
    total_pages: number;
    has_more: boolean;
    records: DetailedUnlockMethod[];
  }> {
    const {
      codes = [
        "unlock_fingerprint",
        "unlock_password",
        "unlock_card",
        "unlock_face",
      ],
      unlock_name = "",
      page_no = 1,
      page_size = 20,
    } = options;

    return tuyaRequest({
      method: "GET",
      path: `/v1.0/smart-lock/devices/${deviceId}/opmodes/${userId}`,
      query: {
        codes: codes.join(","),
        unlock_name,
        page_no,
        page_size,
      },
    });
  }
}

// ============================================================================
// 4. DOOR CONTROL / REMOTE UNLOCKING APIs
// ============================================================================

export class DoorControlAPI {
  /**
   * Unlock door with password
   * Note: Password must be AES encrypted using ticket_key
   */
  static async unlockWithPassword(
    deviceId: string,
    data: {
      password: string; // AES encrypted password
      password_type: "ticket";
      ticket_id: string;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/door-lock/open-door`,
      body: data,
    });
  }

  /**
   * Unlock door without password
   * Requires ticket_id from getPasswordTicket()
   */
  static async unlockWithoutPassword(
    deviceId: string,
    data: {
      ticket_id: string;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/door-lock/password-free/open-door`,
      body: data,
    });
  }

  /**
   * Revoke password-free unlocking
   * @param type - 1: owner rejects, 2: initiator cancels
   */
  static async revokePasswordFreeUnlock(
    deviceId: string,
    data: {
      type: 1 | 2;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/password-free/open-door/cancel`,
      body: data,
    });
  }

  /**
   * Remote lock/unlock without password
   * @param open - true: unlock (default), false: lock
   */
  static async remoteDoorOperate(
    deviceId: string,
    data: {
      ticket_id: string;
      open?: boolean;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/smart-lock/devices/${deviceId}/password-free/door-operate`,
      body: data,
    });
  }

  /**
   * Get supported remote unlock methods
   */
  static async getRemoteUnlockMethods(
    deviceId: string
  ): Promise<RemoteUnlockMethod[]> {
    const result = await tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/remote-unlocks`,
    });

    // API may return single object or array
    if (Array.isArray(result)) {
      return result;
    }
    if (result && typeof result === "object") {
      return [result as RemoteUnlockMethod];
    }
    return [];
  }

  /**
   * Set remote unlock method switch (enable/disable)
   */
  static async configureRemoteUnlock(
    deviceId: string,
    data: {
      remote_unlock_type: "remoteUnlockWithoutPwd" | "remoteUnlockWithPwd";
      open: boolean;
      device_id?: string;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/door-lock/remote-unlock/config`,
      body: data,
    });
  }
}

// ============================================================================
// 5. HISTORY & LOGS APIs
// ============================================================================

export class HistoryAPI {
  /**
   * Query unlocking history
   */
  static async getUnlockLogs(
    deviceId: string,
    params?: {
      start_time?: number;
      end_time?: number;
      page_size?: number;
      last_row_key?: string;
    }
  ): Promise<UnlockRecord[]> {
    const result = await tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/open-logs${
        params ? "?" + new URLSearchParams(params as any).toString() : ""
      }`,
    });

    return extractArray<UnlockRecord>(result);
  }

  /**
   * Query unlocking history v1.1
   */
  static async getUnlockLogsV11(
    deviceId: string,
    params?: {
      start_time?: number;
      end_time?: number;
      page_size?: number;
      last_row_key?: string;
    }
  ): Promise<UnlockRecord[]> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    return tuyaRequest({
      method: "GET",
      path: `/v1.1/devices/${deviceId}/door-lock/open-logs${queryString}`,
    });
  }

  /**
   * Get alert/alarm history
   */
  static async getAlarmLogs(
    deviceId: string,
    params?: {
      start_time?: number;
      end_time?: number;
      page_size?: number;
      last_row_key?: string;
    }
  ): Promise<AlarmRecord[]> {
    try {
      const result = await tuyaRequest({
        method: "GET",
        path: `/v1.0/devices/${deviceId}/door-lock/alarm-logs${
          params ? "?" + new URLSearchParams(params as any).toString() : ""
        }`,
      });

      return extractArray<AlarmRecord>(result);
    } catch (error: any) {
      // Alarm logs might not be supported - return empty array
      console.warn(error, "Alarm logs not available for this device");
      return [];
    }
  }

  /**
   * Get alert history v1.1
   */
  static async getAlarmLogsV11(
    deviceId: string,
    params?: {
      codes?: string; // Alarm codes to filter (e.g., "doorbell")
      page_no?: number; // Page number
      page_size?: number; // Number of records per page
      show_media_info?: boolean; // Whether to include media URLs
    }
  ): Promise<AlarmRecord[]> {
    try {
      // Set defaults to match working API call
      const queryParams = {
        codes: params?.codes || "doorbell",
        page_no: String(params?.page_no || 1),
        page_size: String(params?.page_size || 10),
        show_media_info: String(params?.show_media_info !== false),
      };

      const result = await tuyaRequest({
        method: "GET",
        path: `/v1.1/devices/${deviceId}/door-lock/alarm-logs?${new URLSearchParams(
          queryParams
        ).toString()}`,
      });

      return extractArray<AlarmRecord>(result);
    } catch (error: any) {
      console.warn(error, "Alarm logs not available for this device");
      return [];
    }
  }

  /**
   * Get combined alert and unlocking history
   */
  static async getCombinedRecords(
    deviceId: string,
    params?: {
      start_time?: number;
      end_time?: number;
      page_size?: number;
      last_row_key?: string;
    }
  ): Promise<CombinedRecord[]> {
    const result = await tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/records${
        params ? "?" + new URLSearchParams(params as any).toString() : ""
      }`,
    });

    return extractArray<CombinedRecord>(result);
  }

  /**
   * Link a history record with a user
   */
  static async linkRecordToUser(
    deviceId: string,
    recordId: string,
    userId: string
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/door-lock/records/${recordId}/actions/allocate`,
      body: { user_id: userId },
    });
  }
}

// ============================================================================
// 6. MEDIA MANAGEMENT APIs
// ============================================================================

export class MediaAPI {
  /**
   * Get cover image of last remote unlock or alert
   */
  static async getLatestMediaUrl(deviceId: string): Promise<MediaInfo> {
    return tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/latest/media/url`,
    });
  }

  /**
   * Get list of albums
   */
  static async getAlbums(
    deviceId: string,
    params?: {
      start_time?: number;
      end_time?: number;
      page_size?: number;
    }
  ): Promise<Album[]> {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    return tuyaRequest({
      method: "GET",
      path: `/v1.0/smart-lock/devices/${deviceId}/albums-media${queryString}`,
    });
  }

  /**
   * Query the number of times videos have been viewed
   */
  static async getMediaViewTimes(
    deviceId: string
  ): Promise<{ view_times: number }> {
    return tuyaRequest({
      method: "GET",
      path: `/v1.0/smart-lock/devices/${deviceId}/media-view-times`,
    });
  }

  /**
   * Increment video view count
   */
  static async incrementMediaViewTimes(deviceId: string): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/smart-lock/devices/${deviceId}/media-view-times`,
    });
  }
}

// ============================================================================
// 7. SECURITY / DURESS ALARMS APIs
// ============================================================================

export class SecurityAPI {
  /**
   * Set an unlocking method to trigger duress alarm
   */
  static async setDuressAlarm(
    deviceId: string,
    unlockType: number,
    unlockNo: number
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/unlock-types/${unlockType}/keys/${unlockNo}/hijack`,
    });
  }

  /**
   * Delete duress alarm for an unlocking method
   */
  static async deleteDuressAlarm(
    deviceId: string,
    unlockType: number,
    unlockSn: string
  ): Promise<boolean> {
    return tuyaRequest({
      method: "DELETE",
      path: `/v1.0/smart-lock/devices/${deviceId}/unlock-types/${unlockType}/keys/${unlockSn}/hijack`,
    });
  }
}

// ============================================================================
// 8. DEVICE INFORMATION APIs
// ============================================================================

export class DeviceAPI {
  /**
   * Get device information (includes local_key for encryption)
   */
  static async getDeviceInfo(deviceId: string): Promise<DeviceInfo> {
    return tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}`,
    });
  }
}

// ============================================================================
// UNIFIED API WRAPPER - Export all APIs as a single object
// ============================================================================

export const TuyaSmartLockAPI = {
  Password: PasswordAPI,
  User: UserAPI,
  UnlockMethod: UnlockMethodAPI,
  DoorControl: DoorControlAPI,
  History: HistoryAPI,
  Media: MediaAPI,
  Security: SecurityAPI,
  Device: DeviceAPI,
};

export default TuyaSmartLockAPI;
