// components/smartlock/history/AlarmHistoryList.tsx

"use client";

import { useState, useEffect } from "react";
import { AlarmRecord } from "@/lib/tuya/tuya-api-wrapper";
import {
  AlertTriangle,
  Clock,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { ensureArray } from "@/lib/utils/array-helpers";

interface AlarmHistoryListProps {
  deviceId: string;
}

export default function AlarmHistoryList({ deviceId }: AlarmHistoryListProps) {
  const [records, setRecords] = useState<AlarmRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  useEffect(() => {
    fetchRecords();
  }, [deviceId, dateRange]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `/api/smartlock/history/alarms?deviceId=${deviceId}`;

      if (dateRange.start) {
        const startTime = new Date(dateRange.start).getTime() / 1000;
        url += `&startTime=${startTime}`;
      }

      if (dateRange.end) {
        const endTime = new Date(dateRange.end).getTime() / 1000;
        url += `&endTime=${endTime}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRecords(ensureArray(data.data));
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      console.error("Error fetching alarm history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getAlarmSeverity = (type: number) => {
    if (type >= 5) return "high";
    if (type >= 3) return "medium";
    return "low";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + Date Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Alarm History</h2>

        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Error Message (same pattern as UnlockHistoryList) */}
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

      {/* Empty State */}
      {records.length === 0 && !error ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No alarm records found</p>
          <p className="text-gray-400 text-sm mt-1">
            Alarm events will appear here when they occur
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            const severity = getAlarmSeverity(record.alarm_type);
            const severityColors = {
              high: "border-red-300 bg-red-50",
              medium: "border-orange-300 bg-orange-50",
              low: "border-yellow-300 bg-yellow-50",
            };

            return (
              <div
                key={record.id}
                className={`rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${severityColors[severity]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle
                        className={`w-5 h-5 ${
                          severity === "high"
                            ? "text-red-600"
                            : severity === "medium"
                            ? "text-orange-600"
                            : "text-yellow-600"
                        }`}
                      />
                      <h3 className="font-semibold text-gray-900">
                        {record.alarm_message || `Alarm #${record.id}`}
                      </h3>

                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          severity === "high"
                            ? "bg-red-200 text-red-800"
                            : severity === "medium"
                            ? "bg-orange-200 text-orange-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(record.time)}</span>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      <span>Alarm Type: {record.alarm_type}</span>
                    </div>
                  </div>

                  {record.media_url && (
                    <div className="ml-4">
                      <a
                        href={record.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                      >
                        <ImageIcon className="w-4 h-4" />
                        View Image
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
