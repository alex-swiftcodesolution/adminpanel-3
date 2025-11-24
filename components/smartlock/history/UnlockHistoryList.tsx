// components/smartlock/history/UnlockHistoryList.tsx

"use client";

import { useState, useEffect } from "react";
import { UnlockRecord } from "@/lib/tuya/tuya-api-wrapper";
import {
  Clock,
  User,
  Key,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

interface UnlockHistoryListProps {
  deviceId: string;
}

export default function UnlockHistoryList({
  deviceId,
}: UnlockHistoryListProps) {
  const [records, setRecords] = useState<UnlockRecord[]>([]);
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

      let url = `/api/smartlock/history/unlocks?deviceId=${deviceId}`;

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

      console.log("📊 Unlock history response:", data); // Debug log

      if (data.success && data.data) {
        // Ensure data.data is an array
        const recordsArray = Array.isArray(data.data) ? data.data : [];
        setRecords(recordsArray);
      } else if (data.error) {
        setError(data.error);
        setRecords([]); // Set empty array on error
      } else {
        setRecords([]); // Default to empty array
      }
    } catch (error: any) {
      console.error("Error fetching unlock history:", error);
      setError(error.message);
      setRecords([]); // Set empty array on exception
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getUnlockTypeName = (type: number) => {
    const types: Record<number, string> = {
      0: "Password",
      1: "Fingerprint",
      2: "Card",
      3: "Bluetooth",
      4: "Face Recognition",
      5: "Key",
      6: "Remote",
    };
    return types[type] || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Unlock History</h2>

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

      {records.length === 0 && !error ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No unlock records found</p>
          <p className="text-gray-400 text-sm mt-1">
            Records will appear here after the door is unlocked
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">
                      {record.unlock_name || `Unlock #${record.unlock_id}`}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {getUnlockTypeName(record.unlock_type)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(record.time)}</span>
                    </div>

                    {record.user_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{record.user_name}</span>
                      </div>
                    )}
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
          ))}
        </div>
      )}
    </div>
  );
}
