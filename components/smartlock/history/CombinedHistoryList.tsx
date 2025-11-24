/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/history/CombinedHistoryList.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { CombinedRecordItem } from "@/lib/tuya/tuya-api-wrapper";
import {
  Clock,
  User,
  Key,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Link as LinkIcon,
  Fingerprint,
  CreditCard,
  Eye,
  Video,
} from "lucide-react";
import LinkUserModal from "./LinkUserModal";

interface CombinedHistoryListProps {
  deviceId: string;
}

interface PaginatedResponse {
  total: number;
  total_pages: number;
  has_more: boolean;
  records: CombinedRecordItem[];
}

// Map DP codes to display names and icons
const DP_CODE_MAP: Record<string, { name: string; icon: React.ReactNode }> = {
  unlock_fingerprint: {
    name: "Fingerprint",
    icon: <Fingerprint className="w-4 h-4" />,
  },
  unlock_password: { name: "Password", icon: <Key className="w-4 h-4" /> },
  unlock_card: { name: "Card", icon: <CreditCard className="w-4 h-4" /> },
  unlock_face: { name: "Face Recognition", icon: <Eye className="w-4 h-4" /> },
  unlock_key: { name: "Mechanical Key", icon: <Key className="w-4 h-4" /> },
  alarm_lock: {
    name: "Lock Alarm",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  hijack: { name: "Duress Alarm", icon: <AlertTriangle className="w-4 h-4" /> },
  doorbell: { name: "Doorbell", icon: <AlertCircle className="w-4 h-4" /> },
};

export default function CombinedHistoryList({
  deviceId,
}: CombinedHistoryListProps) {
  const [data, setData] = useState<PaginatedResponse>({
    total: 0,
    total_pages: 0,
    has_more: false,
    records: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Link User Modal State
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{
    id: string;
    userId?: string;
    userName?: string;
    canLink: boolean;
  } | null>(null);

  const fetchRecords = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          deviceId,
          pageNo: String(page),
          pageSize: "20",
        });

        if (dateRange.start) {
          params.append(
            "startTime",
            String(Math.floor(new Date(dateRange.start).getTime() / 1000))
          );
        }
        if (dateRange.end) {
          params.append(
            "endTime",
            String(Math.floor(new Date(dateRange.end).getTime() / 1000))
          );
        }

        const response = await fetch(
          `/api/smartlock/history/combined?${params.toString()}`
        );
        const result = await response.json();

        if (result.success) {
          setData(result.data);
          setPageNo(page);
        } else {
          setError(result.error || "Failed to fetch records");
        }
      } catch (err: any) {
        console.error("Error fetching combined history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [deviceId, dateRange]
  );

  useEffect(() => {
    fetchRecords(1);
  }, [fetchRecords]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getDpInfo = (dps: Array<Record<string, string | number>>) => {
    if (!dps || dps.length === 0)
      return { name: "Unknown", icon: <Key className="w-4 h-4" /> };

    const firstDp = dps[0];
    const code = Object.keys(firstDp)[0];
    return (
      DP_CODE_MAP[code] || { name: code, icon: <Key className="w-4 h-4" /> }
    );
  };

  const handleOpenLinkModal = (record: CombinedRecordItem) => {
    setSelectedRecord({
      id: record.record_id,
      userId: record.user_id,
      userName: record.user_name,
      canLink: record.member_bindable_flag === 1,
    });
    setLinkModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">All Records</h2>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
            {data.total} records
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
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

      {/* Info Banner */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
        <p>
          <strong>💡 Tip:</strong> Use this view to link records to users. Only
          records marked as &quot;Linkable&quot; can be associated with a user.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && data.records.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No records found</p>
          <p className="text-gray-400 text-sm mt-1">
            Records will appear here after lock activity
          </p>
        </div>
      )}

      {/* Records List */}
      {!loading && data.records.length > 0 && (
        <div className="space-y-3">
          {data.records.map((record) => {
            const dpInfo = getDpInfo(record.dps);
            const isAlarm = record.record_type === "alarm";
            const hasMedia =
              record.media_info_list && record.media_info_list.length > 0;
            const canLink = record.member_bindable_flag === 1;

            return (
              <div
                key={record.record_id}
                className={`rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
                  isAlarm
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`p-1.5 rounded-lg ${
                          isAlarm
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {dpInfo.icon}
                      </span>
                      <h3 className="font-semibold text-gray-900">
                        {record.unlock_name || dpInfo.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          isAlarm
                            ? "bg-red-200 text-red-800"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {isAlarm ? "Alarm" : "Unlock"}
                      </span>
                      {canLink && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Linkable
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(record.gmt_create)}</span>
                      </div>

                      {/* Union unlock info (for combination unlocking) */}
                      {record.union_unlock_info &&
                        record.union_unlock_info.length > 0 && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <p className="font-medium mb-1">
                              Combination Unlock:
                            </p>
                            {record.union_unlock_info.map((info, i) => (
                              <p key={i}>
                                {info.user_name} - {info.unlock_name} (
                                {info.opmode})
                              </p>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col gap-2 items-end">
                    {/* Media Preview */}
                    {hasMedia && (
                      <div className="flex gap-2">
                        {record.media_info_list!.slice(0, 2).map((media, i) => (
                          <a
                            key={i}
                            href={media.file_url || media.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                          >
                            {media.media_url ? (
                              <>
                                <Video className="w-4 h-4" />
                                Video
                              </>
                            ) : (
                              <>
                                <ImageIcon className="w-4 h-4" />
                                Image
                              </>
                            )}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Change User Button */}
                    {record.user_name && canLink && (
                      <button
                        onClick={() => handleOpenLinkModal(record)}
                        className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors text-xs"
                        title="Change linked user"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Change
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && data.total > 20 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Page {pageNo} of {data.total_pages} ({data.total} total)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRecords(pageNo - 1)}
              disabled={pageNo <= 1 || loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="px-3 py-1 text-sm text-gray-600">
              Page {pageNo}
            </span>

            <button
              onClick={() => fetchRecords(pageNo + 1)}
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
        recordType="unlock"
        currentUserId={selectedRecord?.userId}
        currentUserName={selectedRecord?.userName}
        onSuccess={() => fetchRecords(pageNo)}
      />
    </div>
  );
}
