"use client";

import { useEffect, useState } from "react";
import { CombinedRecordItem } from "@/lib/tuya/tuya-api-wrapper";
import Image from "next/image";
import { X, User, Clock, AlertTriangle, Unlock } from "lucide-react";

interface EventNotificationDialogProps {
  event: CombinedRecordItem | null;
  onDismiss: () => void;
  onOpenDoor?: () => void;
  autoHideAfter?: number;
}

export default function EventNotificationDialog({
  event,
  onDismiss,
  onOpenDoor,
  autoHideAfter = 30000,
}: EventNotificationDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setIsVisible(true);

      const timeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, autoHideAfter);

      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [event, autoHideAfter, onDismiss]);

  if (!event) return null;

  const eventTime = new Date(event.gmt_create);
  const firstDp = event.dps[0];
  const dpCode = firstDp ? Object.keys(firstDp)[0] : "";
  const dpValue = firstDp ? Object.values(firstDp)[0] : "";

  let eventTitle = "🔔 New Event";
  let eventIcon = "🔔";
  let eventColor = "blue";

  if (dpCode === "doorbell") {
    eventTitle = "Someone's at the Door!";
    eventIcon = "🔔";
    eventColor = "blue";
  } else if (dpCode.includes("unlock")) {
    eventTitle = "Door Unlocked";
    eventIcon = "🔓";
    eventColor = "green";
  } else if (dpCode === "hijack") {
    eventTitle = "⚠️ Duress Alarm!";
    eventIcon = "🚨";
    eventColor = "red";
  } else if (dpCode === "alarm_lock") {
    eventTitle = "🚨 Lock Alarm!";
    eventIcon = "⚠️";
    eventColor = "orange";
  }

  const mediaUrl =
    event.media_info_list?.[0]?.file_url ||
    event.media_info_list?.[0]?.media_url;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onDismiss}
      />

      {/* Dialog */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="bg-background border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className={`p-6 ${
              eventColor === "red"
                ? "bg-red-500"
                : eventColor === "orange"
                ? "bg-orange-500"
                : eventColor === "green"
                ? "bg-green-500"
                : "bg-blue-500"
            }`}
          >
            <div className="flex items-center justify-between text-white">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-3xl">{eventIcon}</span>
                {eventTitle}
              </h2>
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Media */}
            {mediaUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={mediaUrl}
                  alt="Event snapshot"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {/* Event Details */}
            <div className="space-y-3">
              {/* User Info */}
              {event.user_name && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Person</p>
                    <p className="font-medium">{event.user_name}</p>
                  </div>
                </div>
              )}

              {/* Unlock Method */}
              {event.unlock_name && (
                <div className="flex items-center gap-3">
                  <Unlock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p className="font-medium">{event.unlock_name}</p>
                  </div>
                </div>
              )}

              {/* Time */}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{eventTime.toLocaleString()}</p>
                </div>
              </div>

              {/* Event Type */}
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Event Type</p>
                  <p className="font-medium">
                    {dpCode.replace(/_/g, " ").toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Union Unlock Info */}
              {event.union_unlock_info &&
                event.union_unlock_info.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">
                      Multiple Unlock Methods:
                    </p>
                    <ul className="text-sm space-y-1">
                      {event.union_unlock_info.map((unlock, idx) => (
                        <li key={idx}>
                          • {unlock.user_name} - {unlock.unlock_name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {dpCode === "doorbell" && onOpenDoor && (
                <button
                  onClick={() => {
                    onOpenDoor();
                    onDismiss();
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Unlock className="w-5 h-5" />
                  Unlock Door
                </button>
              )}

              <button
                onClick={onDismiss}
                className={`${
                  dpCode === "doorbell" ? "flex-1" : "w-full"
                } bg-secondary hover:bg-secondary/80 px-4 py-3 rounded-lg font-medium transition-colors`}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
