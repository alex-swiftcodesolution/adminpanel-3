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
  user_name: string;
  user_type: number;
  avatar?: string;
  role?: number;
  unlock_methods?: UnlockMethod[];
}

export interface HomeUser extends DeviceUser {
  effective_time?: number;
  invalid_time?: number;
  schedule?: string;
}

// Unlock Method Types
export interface UnlockMethod {
  unlock_sn: string;
  unlock_type: number;
  unlock_name: string;
  unlock_no: number;
  is_hijack?: boolean;
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
  unlock_type: number;
  unlock_name: string;
  is_enabled: boolean;
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
   * Create a device user (note: endpoint says POST but description says delete - check docs)
   */
  static async createDeviceUser(
    deviceId: string,
    data: {
      user_name: string;
      user_type: number;
      avatar?: string;
    }
  ): Promise<DeviceUser> {
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
      user_name?: string;
      avatar?: string;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/users/${userId}`,
      body: data,
    });
  }

  /**
   * Update the role of a device user
   */
  static async updateUserRole(
    deviceId: string,
    userId: string,
    role: number
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
   * Query list of users by device ID (v1.1)
   */
  static async getDeviceUsersV11(deviceId: string): Promise<DeviceUser[]> {
    return tuyaRequest({
      method: "GET",
      path: `/v1.1/devices/${deviceId}/users`,
    });
  }

  /**
   * Get list of home users and unlocking methods
   */
  static async getHomeUsers(deviceId: string): Promise<HomeUser[]> {
    const result = await tuyaRequest({
      method: "GET",
      path: `/v1.0/smart-lock/devices/${deviceId}/users`,
    });

    return extractArray<HomeUser>(result);
  }

  /**
   * Update the validity period of a home user
   */
  static async updateHomeUserSchedule(
    deviceId: string,
    userId: string,
    data: {
      effective_time: number;
      invalid_time: number;
      schedule?: string;
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
   * Delete information about users
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
}

// ============================================================================
// 3. UNLOCKING METHOD MANAGEMENT APIs
// ============================================================================

export class UnlockMethodAPI {
  /**
   * Assign unlocking methods to users
   */
  static async assignUnlockMethods(
    deviceId: string,
    data: {
      user_id: string;
      unlock_methods: Array<{
        unlock_type: number;
        unlock_no: number;
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
   * Get list of unlocking methods assigned to a home user
   */
  static async getAssignedKeys(
    deviceId: string,
    userType: number,
    userId: string
  ): Promise<UnlockMethod[]> {
    const result = await tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/user-types/${userType}/users/${userId}/assigned-keys`,
    });

    return extractArray<UnlockMethod>(result);
  }

  /**
   * Get list of unlocking methods not assigned to any home user
   */
  static async getUnassignedKeys(deviceId: string): Promise<UnlockMethod[]> {
    const result = await tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/unassigned-keys`,
    });

    // Extract array from Tuya's response format
    return extractArray<UnlockMethod>(result);
  }

  /**
   * Get unlocking methods for a specified user
   */
  static async getUserUnlockMethods(
    deviceId: string,
    userId: string
  ): Promise<UnlockMethod[]> {
    const result = await tuyaRequest({
      method: "GET",
      path: `/v1.0/smart-lock/devices/${deviceId}/opmodes/${userId}`,
    });

    return extractArray<UnlockMethod>(result);
  }

  /**
   * Synchronize unlocking methods by cloud
   */
  static async syncUnlockMethods(deviceId: string): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/smart-lock/devices/${deviceId}/opmodes/actions/sync`,
    });
  }

  /**
   * Enroll unlocking methods for home users
   */
  static async enrollUnlockMethod(
    deviceId: string,
    data: {
      unlock_type: number;
      user_id: string;
      user_type: number;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/actions/entry`,
      body: data,
    });
  }

  /**
   * Delete an unlocking method used by home users
   */
  static async deleteUnlockMethod(
    deviceId: string,
    userType: number,
    userId: string,
    unlockType: number,
    unlockNo: number
  ): Promise<boolean> {
    return tuyaRequest({
      method: "DELETE",
      path: `/v1.0/devices/${deviceId}/door-lock/user-types/${userType}/users/${userId}/unlock-types/${unlockType}/keys/${unlockNo}`,
    });
  }

  /**
   * Cancel enrollment of unlocking method
   */
  static async cancelEnrollment(
    deviceId: string,
    unlockType: number
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/unlock-types/${unlockType}/actions/cancel`,
    });
  }

  /**
   * Update the name of an unlocking method
   */
  static async updateUnlockMethodName(
    deviceId: string,
    unlockSn: string,
    name: string
  ): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/opmodes/${unlockSn}`,
      body: { unlock_name: name },
    });
  }

  /**
   * Add attribute to unlocking method (e.g., enable image capturing)
   */
  static async addUnlockMethodAttribute(
    deviceId: string,
    opmodeId: string,
    attribute: string,
    value: any
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/smart-lock/devices/${deviceId}/opmodes/${opmodeId}/attribute/${attribute}/opmode-attr`,
      body: { value },
    });
  }
}

// ============================================================================
// 4. DOOR CONTROL / REMOTE UNLOCKING APIs
// ============================================================================

export class DoorControlAPI {
  /**
   * Unlock door with password
   */
  static async unlockWithPassword(
    deviceId: string,
    data: {
      password: string;
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
   */
  static async unlockWithoutPassword(deviceId: string): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.0/devices/${deviceId}/door-lock/password-free/open-door`,
    });
  }

  /**
   * Unlock door without password v1.1 (can specify channel)
   */
  static async unlockWithoutPasswordV11(
    deviceId: string,
    data?: {
      channel?: number;
    }
  ): Promise<boolean> {
    return tuyaRequest({
      method: "POST",
      path: `/v1.1/devices/${deviceId}/door-lock/password-free/open-door`,
      body: data || {},
    });
  }

  /**
   * Revoke password-free unlocking
   */
  static async revokePasswordFreeUnlock(deviceId: string): Promise<boolean> {
    return tuyaRequest({
      method: "PUT",
      path: `/v1.0/devices/${deviceId}/door-lock/password-free/open-door/cancel`,
    });
  }

  /**
   * Remote lock/unlock without password
   */
  static async remoteDoorOperate(
    deviceId: string,
    data: {
      operate: "lock" | "unlock";
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
    return tuyaRequest({
      method: "GET",
      path: `/v1.0/devices/${deviceId}/door-lock/remote-unlocks`,
    });
  }

  /**
   * Set remote unlock method switch (enable/disable)
   */
  static async configureRemoteUnlock(
    deviceId: string,
    data: {
      unlock_type: number;
      is_enabled: boolean;
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
      console.warn("Alarm logs not available for this device");
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
      console.warn("Alarm logs not available for this device");
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
