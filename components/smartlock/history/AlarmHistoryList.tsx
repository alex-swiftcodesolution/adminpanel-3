/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/history/AlarmHistoryList.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlarmLogItem, MediaInfoItem } from "@/lib/tuya/tuya-api-wrapper";
import { ALARM_TYPE_MAP, ALARM_VALUE_MAP } from "@/lib/tuya/constants";
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
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MediaPreviewModal from "./MediaPreviewModal";

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

const ALARM_ICONS: Record<string, React.ReactNode> = {
  hijack: <ShieldAlert className="w-4 h-4" />,
  alarm_lock: <AlertTriangle className="w-4 h-4" />,
  doorbell: <Bell className="w-4 h-4" />,
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
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // Media Modal State
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    mediaInfos: MediaInfoItem[];
    timestamp?: number;
    title?: string;
  } | null>(null);

  // Track previous filter to detect changes
  const prevFilterRef = useRef<string>(alarmFilter);
  const isFirstRender = useRef(true);

  const fetchRecords = async (
    pageNo: number = 1,
    filter: string = alarmFilter
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        deviceId,
        pageNo: String(pageNo),
        pageSize: "20",
      });

      if (filter !== "all") {
        params.append("codes", filter);
      } else {
        params.append("codes", "alarm_lock,hijack,doorbell");
      }

      const response = await fetch(
        `/api/smartlock/history/alarms?${params.toString()}`
      );
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setLastRefreshTime(new Date());
      } else {
        setError(result.error || "Failed to fetch records");
      }
    } catch (err: any) {
      console.error("Error fetching alarm history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch only
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchRecords(1);
    }
  }, [deviceId]);

  // Handle filter changes
  useEffect(() => {
    if (prevFilterRef.current !== alarmFilter && !isFirstRender.current) {
      prevFilterRef.current = alarmFilter;
      fetchRecords(1, alarmFilter);
    }
  }, [alarmFilter]);

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

  const getAlarmInfo = (code: string) => {
    const info = ALARM_TYPE_MAP[code];
    return {
      name: info?.name || code,
      severity: info?.severity || ("medium" as const),
      icon: ALARM_ICONS[code] || <AlertTriangle className="w-4 h-4" />,
    };
  };

  const getAlarmMessage = (value: string | object) => {
    if (typeof value === "string") {
      return ALARM_VALUE_MAP[value] || value;
    }
    return JSON.stringify(value);
  };

  const handleOpenMediaModal = (record: AlarmLogItem) => {
    const statusItem = Array.isArray(record.status)
      ? record.status[0]
      : record.status;
    setSelectedMedia({
      mediaInfos: record.media_infos || [],
      timestamp: record.update_time,
      title: `${getAlarmInfo(statusItem?.code || "alarm_lock").name} - Media`,
    });
    setMediaModalOpen(true);
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const totalPages = Math.ceil(data.total / data.page_size);

  if (loading && data.records.length === 0) {
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
                <AlertTriangle className="h-5 w-5" />
                Alarm History
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {formatTimeAgo(lastRefreshTime)}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="font-normal">
                {data.total} records
              </Badge>

              <Select value={alarmFilter} onValueChange={setAlarmFilter}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alarms</SelectItem>
                  <SelectItem value="alarm_lock">Lock Alarms</SelectItem>
                  <SelectItem value="hijack">Duress Alarms</SelectItem>
                  <SelectItem value="doorbell">Doorbell</SelectItem>
                </SelectContent>
              </Select>

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
          {/* Error */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Unable to load alarm history. This may be a new device with no
                alarm events yet.
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          <AnimatePresence mode="wait">
            {!loading && data.records.length === 0 && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No alarm records found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Alarm events will appear here when they occur
                </p>
              </motion.div>
            )}

            {/* Records List */}
            {!loading && data.records.length > 0 && (
              <motion.div
                key="list"
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {data.records.map((record, index) => {
                  const statusItem = Array.isArray(record.status)
                    ? record.status[0]
                    : record.status;
                  const alarmInfo = getAlarmInfo(
                    statusItem?.code || "alarm_lock"
                  );
                  const hasMedia =
                    record.media_infos && record.media_infos.length > 0;

                  return (
                    <motion.div
                      key={`${record.update_time}-${index}`}
                      variants={item}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-lg border transition-all hover:border-foreground/20 ${
                        alarmInfo.severity === "high"
                          ? "border-destructive/30 bg-destructive/5"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`p-1.5 rounded-lg ${
                                alarmInfo.severity === "high"
                                  ? "bg-destructive/10 text-destructive"
                                  : alarmInfo.severity === "medium"
                                  ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {alarmInfo.icon}
                            </span>
                            <h3 className="font-semibold">{alarmInfo.name}</h3>
                            <Badge
                              variant={getSeverityVariant(alarmInfo.severity)}
                            >
                              {alarmInfo.severity.toUpperCase()}
                            </Badge>
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

                            {statusItem?.value && (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" />
                                <span>{getAlarmMessage(statusItem.value)}</span>
                              </div>
                            )}

                            {record.nick_name && (
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                <span>{record.nick_name}</span>
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
