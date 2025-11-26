/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/history/UnlockHistoryList.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Loader2,
  Unlock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
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
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

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
          setLastRefreshTime(new Date());
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

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString();
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

  if (loading && data.logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Unlock className="h-5 w-5" />
                Unlock History
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {formatTimeAgo(lastRefreshTime)}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="font-normal">
                {data.total} records
              </Badge>

              <Button
                onClick={() => fetchRecords(data.page_no)}
                disabled={loading}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Date Filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="startDate" className="text-xs">
                From
              </Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="h-9 w-auto"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate" className="text-xs">
                To
              </Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="h-9 w-auto"
              />
            </div>
            <Button
              onClick={() => fetchRecords(1)}
              disabled={loading}
              variant="secondary"
              size="sm"
              className="h-9"
            >
              Apply Filter
            </Button>
          </div>

          {/* Error */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Unable to load history. This might be a new device with no
                unlock events yet.
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          <AnimatePresence mode="wait">
            {!loading && data.logs.length === 0 && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Unlock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No unlock records found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Records will appear here after the door is unlocked
                </p>
              </motion.div>
            )}

            {/* Records List */}
            {!loading && data.logs.length > 0 && (
              <motion.div
                key="list"
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {data.logs.map((record, index) => {
                  const unlockInfo = getUnlockInfo(record.status.code);
                  const hasMedia =
                    record.media_infos && record.media_infos.length > 0;

                  return (
                    <motion.div
                      key={`${record.update_time}-${index}`}
                      variants={item}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 rounded-lg border transition-all hover:border-foreground/20"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
                              {unlockInfo.icon}
                            </span>
                            <h3 className="font-semibold">
                              {record.unlock_name || unlockInfo.name}
                            </h3>
                            <Badge variant="secondary">{unlockInfo.name}</Badge>
                            {hasMedia && (
                              <Badge variant="outline" className="gap-1">
                                <ImageIcon className="w-3 h-3" />
                                {record.media_infos!.length} media
                              </Badge>
                            )}
                          </div>

                          {/* Details */}
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(record.update_time)}</span>
                            </div>

                            {record.nick_name && (
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                <span>{record.nick_name}</span>
                              </div>
                            )}

                            {record.status.value && (
                              <div className="flex items-center gap-2">
                                <Key className="w-3 h-3" />
                                <span>ID: {String(record.status.value)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Media Button */}
                        {hasMedia && (
                          <Button
                            onClick={() => handleOpenMediaModal(record)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <ImageIcon className="w-4 h-4" />
                            View Media
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {!loading && data.total > data.page_size && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(data.page_no - 1) * data.page_size + 1} -{" "}
                {Math.min(data.page_no * data.page_size, data.total)} of{" "}
                {data.total}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => fetchRecords(data.page_no - 1)}
                  disabled={data.page_no <= 1 || loading}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="text-sm text-muted-foreground px-2">
                  Page {data.page_no} of {totalPages}
                </span>

                <Button
                  onClick={() => fetchRecords(data.page_no + 1)}
                  disabled={!data.has_more || loading}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
    </>
  );
}
