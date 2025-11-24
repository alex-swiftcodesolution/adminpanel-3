/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/history/UnlockHistoryList.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { UnlockLogItem, MediaInfoItem } from "@/lib/tuya/tuya-api-wrapper";
import {
  Clock,
  User,
  Key,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  CreditCard,
  Smartphone,
  Eye,
  KeyRound,
} from "lucide-react";
import MediaPreviewModal from "./MediaPreviewModal";

interface UnlockHistoryListProps {
  deviceId: string;
}

interface PaginatedResponse {
  total: number;
  logs: UnlockLogItem[];
  page_no: number;
  page_size: number;
  has_more: boolean;
}

const UNLOCK_TYPE_MAP: Record<string, { name: string; icon: React.ReactNode }> =
  {
    unlock_fingerprint: {
      name: "Fingerprint",
      icon: <Fingerprint className="w-4 h-4" />,
    },
    unlock_password: { name: "Password", icon: <Key className="w-4 h-4" /> },
    unlock_temporary: {
      name: "Temporary Password",
      icon: <Clock className="w-4 h-4" />,
    },
    unlock_dynamic: {
      name: "Dynamic Password",
      icon: <KeyRound className="w-4 h-4" />,
    },
    unlock_card: { name: "Card", icon: <CreditCard className="w-4 h-4" /> },
    unlock_face: {
      name: "Face Recognition",
      icon: <Eye className="w-4 h-4" />,
    },
    unlock_key: { name: "Mechanical Key", icon: <Key className="w-4 h-4" /> },
    unlock_app: {
      name: "App Remote",
      icon: <Smartphone className="w-4 h-4" />,
    },
    unlock_identity_card: {
      name: "Identity Card",
      icon: <CreditCard className="w-4 h-4" />,
    },
    unlock_emergency: {
      name: "Emergency Password",
      icon: <AlertCircle className="w-4 h-4" />,
    },
  };

export default function UnlockHistoryList({
  deviceId,
}: UnlockHistoryListProps) {
  const [data, setData] = useState<PaginatedResponse>({
    total: 0,
    logs: [],
    page_no: 1,
    page_size: 20,
    has_more: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Media Modal State
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    mediaInfos: MediaInfoItem[];
    timestamp?: number;
    title?: string;
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
          `/api/smartlock/history/unlocks?${params.toString()}`
        );
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to fetch records");
        }
      } catch (err: any) {
        console.error("Error fetching unlock history:", err);
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
    const ts = timestamp > 9999999999 ? timestamp : timestamp * 1000;
    return new Date(ts).toLocaleString();
  };

  const getUnlockInfo = (code: string) => {
    return (
      UNLOCK_TYPE_MAP[code] || { name: code, icon: <Key className="w-4 h-4" /> }
    );
  };

  const handleOpenMediaModal = (record: UnlockLogItem) => {
    const unlockInfo = getUnlockInfo(record.status.code);
    setSelectedMedia({
      mediaInfos: record.media_infos || [],
      timestamp: record.update_time,
      title: `${unlockInfo.name} - Media`,
    });
    setMediaModalOpen(true);
  };

  const totalPages = Math.ceil(data.total / data.page_size);

  return (
    <div className="space-y-4">
      {/* Header + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">Unlock History</h2>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
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

      {/* Error */}
      {error && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">
              Unable to load history. This might be a new device with no unlock
              events yet.
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && data.logs.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No unlock records found</p>
          <p className="text-gray-400 text-sm mt-1">
            Records will appear here after the door is unlocked
          </p>
        </div>
      )}

      {/* Records List */}
      {!loading && data.logs.length > 0 && (
        <div className="space-y-3">
          {data.logs.map((record, index) => {
            const unlockInfo = getUnlockInfo(record.status.code);
            const hasMedia =
              record.media_infos && record.media_infos.length > 0;

            return (
              <div
                key={`${record.update_time}-${index}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                        {unlockInfo.icon}
                      </span>
                      <h3 className="font-semibold text-gray-900">
                        {record.unlock_name || unlockInfo.name}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {unlockInfo.name}
                      </span>
                      {hasMedia && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                          📷 {record.media_infos!.length} media
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(record.update_time)}</span>
                      </div>

                      {record.nick_name && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{record.nick_name}</span>
                        </div>
                      )}

                      {record.status.value && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Key className="w-4 h-4" />
                          <span>ID: {String(record.status.value)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Media Button */}
                  {hasMedia && (
                    <button
                      onClick={() => handleOpenMediaModal(record)}
                      className="ml-4 flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      <ImageIcon className="w-4 h-4" />
                      View Media
                    </button>
                  )}
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

      {/* Media Preview Modal */}
      <MediaPreviewModal
        isOpen={mediaModalOpen}
        onClose={() => {
          setMediaModalOpen(false);
          setSelectedMedia(null);
        }}
        deviceId={deviceId}
        mediaInfos={selectedMedia?.mediaInfos || []}
        timestamp={selectedMedia?.timestamp}
        title={selectedMedia?.title}
      />
    </div>
  );
}
