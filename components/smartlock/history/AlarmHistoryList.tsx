/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/history/AlarmHistoryList.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AlarmLogItem } from "@/lib/tuya/tuya-api-wrapper";
import {
  AlertTriangle,
  Clock,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Bell,
  ShieldAlert,
  User,
  Link as LinkIcon,
} from "lucide-react";
import LinkUserModal from "./LinkUserModal";

interface AlarmHistoryListProps {
  deviceId: string;
}

interface PaginatedResponse {
  total: number;
  records: AlarmLogItem[];
  page_no: number;
  page_size: number;
  has_more: boolean;
}

// Map alarm codes to display info
const ALARM_TYPE_MAP: Record<
  string,
  { name: string; severity: "high" | "medium" | "low"; icon: React.ReactNode }
> = {
  hijack: {
    name: "Duress Alarm",
    severity: "high",
    icon: <ShieldAlert className="w-5 h-5" />,
  },
  alarm_lock: {
    name: "Lock Alarm",
    severity: "medium",
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  doorbell: {
    name: "Doorbell",
    severity: "low",
    icon: <Bell className="w-5 h-5" />,
  },
};

// Map alarm values to messages
const ALARM_VALUE_MAP: Record<string, string> = {
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

export default function AlarmHistoryList({ deviceId }: AlarmHistoryListProps) {
  const [data, setData] = useState<PaginatedResponse>({
    total: 0,
    records: [],
    page_no: 1,
    page_size: 20,
    has_more: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alarmFilter, setAlarmFilter] = useState<string>("all");

  // Link User Modal State
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{
    id: string;
    userName?: string;
  } | null>(null);

  const fetchRecords = useCallback(
    async (pageNo: number = 1) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          deviceId,
          pageNo: String(pageNo),
          pageSize: "20",
        });

        if (alarmFilter !== "all") {
          params.append("codes", alarmFilter);
        } else {
          params.append("codes", "alarm_lock,hijack,doorbell");
        }

        const response = await fetch(
          `/api/smartlock/history/alarms?${params.toString()}`
        );
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to fetch records");
        }
      } catch (err: any) {
        console.error("Error fetching alarm history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [deviceId, alarmFilter]
  );

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchRecords(1);
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) {
      fetchRecords(1);
    }
  }, [alarmFilter]);

  const formatDate = (timestamp: number) => {
    const ts = timestamp > 9999999999 ? timestamp : timestamp * 1000;
    return new Date(ts).toLocaleString();
  };

  const getAlarmInfo = (code: string) => {
    return (
      ALARM_TYPE_MAP[code] || {
        name: code,
        severity: "medium" as const,
        icon: <AlertTriangle className="w-5 h-5" />,
      }
    );
  };

  const getAlarmMessage = (value: string | object) => {
    if (typeof value === "string") {
      return ALARM_VALUE_MAP[value] || value;
    }
    return JSON.stringify(value);
  };

  const handleOpenLinkModal = (record: AlarmLogItem, index: number) => {
    const recordId = `${record.update_time}-${index}`;
    setSelectedRecord({
      id: recordId,
      userName: record.nick_name,
    });
    setLinkModalOpen(true);
  };

  const severityColors = {
    high: "border-red-300 bg-red-50 text-red-800",
    medium: "border-orange-300 bg-orange-50 text-orange-800",
    low: "border-yellow-300 bg-yellow-50 text-yellow-800",
  };

  const severityBadgeColors = {
    high: "bg-red-200 text-red-800",
    medium: "bg-orange-200 text-orange-800",
    low: "bg-yellow-200 text-yellow-800",
  };

  const totalPages = Math.ceil(data.total / data.page_size);

  return (
    <div className="space-y-4">
      {/* Header + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">Alarm History</h2>
          <span className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">
            {data.total} records
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={alarmFilter}
            onChange={(e) => setAlarmFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Alarms</option>
            <option value="alarm_lock">Lock Alarms</option>
            <option value="hijack">Duress Alarms</option>
            <option value="doorbell">Doorbell</option>
          </select>

          <button
            onClick={() => fetchRecords(1)}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">
              Unable to load alarm history. This may be a new device with no
              alarm events yet.
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && data.records.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No alarm records found</p>
          <p className="text-gray-400 text-sm mt-1">
            Alarm events will appear here when they occur
          </p>
        </div>
      )}

      {/* Records List */}
      {!loading && data.records.length > 0 && (
        <div className="space-y-3">
          {data.records.map((record, index) => {
            const statusItem = Array.isArray(record.status)
              ? record.status[0]
              : record.status;
            const alarmInfo = getAlarmInfo(statusItem?.code || "alarm_lock");
            const hasMedia =
              record.media_infos && record.media_infos.length > 0;

            return (
              <div
                key={`${record.update_time}-${index}`}
                className={`rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
                  severityColors[alarmInfo.severity]
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`p-1.5 rounded-lg ${
                          severityBadgeColors[alarmInfo.severity]
                        }`}
                      >
                        {alarmInfo.icon}
                      </span>
                      <h3 className="font-semibold">{alarmInfo.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          severityBadgeColors[alarmInfo.severity]
                        }`}
                      >
                        {alarmInfo.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(record.update_time)}</span>
                      </div>

                      {statusItem?.value && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>{getAlarmMessage(statusItem.value)}</span>
                        </div>
                      )}

                      {/* {record.nick_name ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{record.nick_name}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenLinkModal(record, index)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span>Link to user</span>
                        </button>
                      )} */}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col gap-2 items-end">
                    {/* Media Preview */}
                    {hasMedia && (
                      <div className="flex gap-2">
                        {record.media_infos!.slice(0, 2).map((media, i) => (
                          <a
                            key={i}
                            href={media.file_url || media.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                          >
                            <ImageIcon className="w-4 h-4" />
                            {media.media_url ? "Video" : "Image"}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Link User Button (if already has user) */}
                    {record.nick_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{record.nick_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && data.total > data.page_size && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {(data.page_no - 1) * data.page_size + 1} -{" "}
            {Math.min(data.page_no * data.page_size, data.total)} of{" "}
            {data.total}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRecords(data.page_no - 1)}
              disabled={data.page_no <= 1 || loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="px-3 py-1 text-sm text-gray-600">
              Page {data.page_no} of {totalPages}
            </span>

            <button
              onClick={() => fetchRecords(data.page_no + 1)}
              disabled={!data.has_more || loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Link User Modal */}
      <LinkUserModal
        isOpen={linkModalOpen}
        onClose={() => {
          setLinkModalOpen(false);
          setSelectedRecord(null);
        }}
        deviceId={deviceId}
        recordId={selectedRecord?.id || ""}
        recordType="alarm"
        currentUserName={selectedRecord?.userName}
        onSuccess={() => fetchRecords(data.page_no)}
      />
    </div>
  );
}
