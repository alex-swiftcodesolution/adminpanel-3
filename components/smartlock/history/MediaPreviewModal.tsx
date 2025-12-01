"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Video,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from "lucide-react";
import { MediaInfoItem } from "@/lib/tuya/tuya-api-wrapper";
import { MEDIA_EVENT_TYPES } from "@/lib/tuya/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
  mediaInfos: MediaInfoItem[];
  eventType?: number;
  timestamp?: number;
  title?: string;
}

export default function MediaPreviewModal({
  isOpen,
  onClose,
  mediaInfos,
  eventType,
  timestamp,
  title,
}: MediaPreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const currentMedia = mediaInfos[currentIndex];
  const hasMultiple = mediaInfos.length > 1;

  // Extract with proper type guards
  const fileUrl = currentMedia?.file_url;
  const fileKey = currentMedia?.file_key;
  const hasImage = !!(fileUrl && fileKey);
  const hasVideo = !!currentMedia?.media_url;

  const proxyUrl =
    hasImage && fileUrl && fileKey
      ? `/api/proxy/image?url=${encodeURIComponent(fileUrl)}&key=${fileKey}`
      : "";

  const goNext = useCallback(
    () => setCurrentIndex((prev) => (prev + 1) % mediaInfos.length),
    [mediaInfos.length]
  );

  const goPrev = useCallback(
    () =>
      setCurrentIndex(
        (prev) => (prev - 1 + mediaInfos.length) % mediaInfos.length
      ),
    [mediaInfos.length]
  );

  useEffect(() => {
    if (isOpen) {
      // Use requestAnimationFrame to defer setState and avoid synchronous state update in effect
      const frameId = requestAnimationFrame(() => {
        setCurrentIndex(0);
        setImageError({});
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasMultiple) goPrev();
      if (e.key === "ArrowRight" && hasMultiple) goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasMultiple, goNext, goPrev]);

  const formatDate = (ts?: number) =>
    ts ? new Date(ts > 9999999999 ? ts : ts * 1000).toLocaleString() : "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 pb-2 shrink-0">
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {title || "Media Preview"}
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            {eventType !== undefined && MEDIA_EVENT_TYPES[eventType] && (
              <Badge variant="secondary">{MEDIA_EVENT_TYPES[eventType]}</Badge>
            )}
            {timestamp && <span>{formatDate(timestamp)}</span>}
            {hasMultiple && (
              <Badge variant="outline">
                {currentIndex + 1} / {mediaInfos.length}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="relative bg-muted flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          {hasMultiple && (
            <>
              <Button
                onClick={goPrev}
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={goNext}
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          <div className="w-full h-full flex items-center justify-center p-4">
            {hasVideo && currentMedia?.media_url ? (
              <video
                src={currentMedia.media_url}
                poster={proxyUrl}
                controls
                autoPlay
                className="max-w-full max-h-[60vh] rounded-lg shadow-lg"
              />
            ) : hasImage ? (
              imageError[currentIndex] ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground p-8 text-center">
                  <ImageOff className="w-12 h-12" />
                  <p>Failed to decrypt image</p>
                </div>
              ) : (
                <Image
                  width={500}
                  height={500}
                  src={proxyUrl}
                  alt="Captured media"
                  className="max-w-full max-h-[60vh] rounded-lg shadow-lg object-contain"
                  onError={() =>
                    setImageError((prev) => ({ ...prev, [currentIndex]: true }))
                  }
                  loading="eager"
                />
              )
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <ImageIcon className="w-12 h-12" />
                <p>No media available</p>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        {hasMultiple && (
          <div className="flex gap-2 p-3 border-t overflow-x-auto bg-muted/50 shrink-0">
            {mediaInfos.map((media, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === currentIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                {media.file_url && media.file_key ? (
                  <Image
                    width={500}
                    height={500}
                    src={`/api/proxy/image?url=${encodeURIComponent(
                      media.file_url
                    )}&key=${media.file_key}`}
                    alt={`Thumb ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "")}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    {media.media_url ? (
                      <Video className="w-5 h-5" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <DialogFooter className="p-4 pt-2 border-t shrink-0 justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {hasImage && (
              <span className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" /> Image
              </span>
            )}
            {hasVideo && (
              <span className="flex items-center gap-1">
                <Video className="w-4 h-4" /> Video
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {hasImage && proxyUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={proxyUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" /> Open Full Size
                </a>
              </Button>
            )}
            <Button onClick={onClose} variant="secondary" size="sm">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
