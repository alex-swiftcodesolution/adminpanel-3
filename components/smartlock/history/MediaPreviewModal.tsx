/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/history/MediaPreviewModal.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Video,
  Loader2,
  AlertCircle,
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
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  deviceId,
  mediaInfos,
  eventType,
  timestamp,
  title,
}: MediaPreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolvedUrls, setResolvedUrls] = useState<MediaInfoItem[]>([]);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen && mediaInfos.length > 0) {
      setCurrentIndex(0);
      setImageError({});
      setImageLoading({});
      resolveMediaUrls();
    }
  }, [isOpen, mediaInfos, deviceId]);

  const resolveMediaUrls = async () => {
    setLoading(true);
    setError(null);

    try {
      const resolved: MediaInfoItem[] = [];

      for (const media of mediaInfos) {
        // Check if URL is already complete (has query params like ?sign=)
        const isComplete =
          media.file_url &&
          (media.file_url.includes("?sign=") ||
            media.file_url.includes("?q-sign") ||
            media.file_url.includes("X-Amz-"));

        if (isComplete) {
          // URL already signed, use directly
          resolved.push(media);
        } else if (media.bucket && media.file_path) {
          // Need to fetch signed URL
          try {
            const params = new URLSearchParams({
              deviceId,
              bucket: media.bucket,
              filePath: media.file_path,
            });

            if (media.media_bucket) {
              params.append("mediaBucket", media.media_bucket);
            }
            if (media.media_path) {
              params.append("mediaPath", media.media_path);
            }

            const response = await fetch(
              `/api/smartlock/media/url?${params.toString()}`
            );
            const data = await response.json();

            if (data.success && data.data) {
              resolved.push({
                ...media,
                file_url: data.data.file_url || media.file_url,
                media_url: data.data.media_url || media.media_url,
              });
            } else {
              // Use original if API fails
              resolved.push(media);
            }
          } catch (err) {
            console.warn("Failed to resolve media URL:", err);
            resolved.push(media);
          }
        } else if (media.file_url) {
          // Has URL but no bucket info, use as-is
          resolved.push(media);
        } else {
          // No URL at all, skip or add placeholder
          resolved.push(media);
        }
      }

      setResolvedUrls(resolved);
    } catch (err: any) {
      console.error("Error resolving media URLs:", err);
      setError(err.message);
      setResolvedUrls(mediaInfos);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts: number) => {
    if (!ts) return "";
    const date = new Date(ts > 9999999999 ? ts : ts * 1000);
    return date.toLocaleString();
  };

  const currentMedia = resolvedUrls[currentIndex];
  const hasMultiple = resolvedUrls.length > 1;
  const hasVideo = currentMedia?.media_url;
  const hasImage = currentMedia?.file_url;
  const currentImageError = imageError[currentIndex];
  const currentImageLoading = imageLoading[currentIndex];

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % resolvedUrls.length);
  };

  const goPrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + resolvedUrls.length) % resolvedUrls.length
    );
  };

  const handleImageError = (index: number) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
    setImageLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageLoad = (index: number) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index: number) => {
    setImageLoading((prev) => ({ ...prev, [index]: true }));
  };

  // Check if URL might be expired (signed URLs typically expire)
  const isUrlPotentiallyExpired = (url: string) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      const expiresParam = urlObj.searchParams.get("X-Amz-Expires");
      const dateParam = urlObj.searchParams.get("X-Amz-Date");

      if (expiresParam && dateParam) {
        // Parse AWS date format: YYYYMMDDTHHMMSSZ
        const year = parseInt(dateParam.substring(0, 4));
        const month = parseInt(dateParam.substring(4, 6)) - 1;
        const day = parseInt(dateParam.substring(6, 8));
        const hour = parseInt(dateParam.substring(9, 11));
        const minute = parseInt(dateParam.substring(11, 13));
        const second = parseInt(dateParam.substring(13, 15));

        const signedDate = new Date(
          Date.UTC(year, month, day, hour, minute, second)
        );
        const expiresSeconds = parseInt(expiresParam);
        const expiryDate = new Date(
          signedDate.getTime() + expiresSeconds * 1000
        );

        return new Date() > expiryDate;
      }
    } catch (e) {
      // If parsing fails, assume URL might be valid
    }
    return false;
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasMultiple) goPrev();
      if (e.key === "ArrowRight" && hasMultiple) goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasMultiple]);

  const urlExpired =
    hasImage && isUrlPotentiallyExpired(currentMedia.file_url!);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
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
                {currentIndex + 1} / {resolvedUrls.length}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="relative bg-muted flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading media...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-4 text-center">
              <Alert variant="destructive" className="max-w-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={resolveMediaUrls} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          ) : resolvedUrls.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground p-4">
              <ImageIcon className="w-12 h-12" />
              <p>No media available</p>
              <p className="text-sm">
                This event did not capture any images or videos
              </p>
            </div>
          ) : (
            <>
              {/* Navigation Arrows */}
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

              {/* Media Display */}
              <div className="w-full h-full flex items-center justify-center p-4">
                {hasVideo ? (
                  <video
                    key={currentMedia.media_url}
                    src={currentMedia.media_url}
                    poster={currentMedia.file_url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[50vh] rounded-lg shadow-lg"
                    onError={() => handleImageError(currentIndex)}
                  >
                    Your browser does not support video playback.
                  </video>
                ) : hasImage && !currentImageError ? (
                  <div className="relative">
                    {currentImageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {/* Use regular img tag with unoptimized to bypass Next.js image optimization */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={currentMedia.file_url}
                      src={currentMedia.file_url}
                      alt="Media preview"
                      className="max-w-full max-h-[50vh] rounded-lg shadow-lg object-contain"
                      onError={() => handleImageError(currentIndex)}
                      onLoad={() => handleImageLoad(currentIndex)}
                      onLoadStart={() => handleImageLoadStart(currentIndex)}
                      loading="eager"
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : currentImageError || urlExpired ? (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground p-8 text-center">
                    <div className="p-4 bg-muted rounded-full">
                      <ImageOff className="w-12 h-12" />
                    </div>
                    <p className="font-medium">Unable to load image</p>
                    <p className="text-sm max-w-xs">
                      {urlExpired
                        ? "The image URL has expired. This happens with older records."
                        : "The image could not be loaded. It may have been deleted or the URL has expired."}
                    </p>
                    {currentMedia?.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="mt-2"
                      >
                        <a
                          href={currentMedia.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Try Opening Directly
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <ImageIcon className="w-12 h-12" />
                    <p>Media URL not available</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails (if multiple) */}
        {hasMultiple && resolvedUrls.length > 0 && !loading && (
          <div className="flex items-center gap-2 p-3 border-t overflow-x-auto bg-muted/50 shrink-0">
            {resolvedUrls.map((media, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-foreground/30"
                } ${imageError[index] ? "opacity-50" : ""}`}
              >
                {media.file_url && !imageError[index] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={media.file_url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    {imageError[index] ? (
                      <ImageOff className="w-4 h-4 text-muted-foreground" />
                    ) : media.media_url ? (
                      <Video className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="p-4 pt-2 border-t shrink-0">
          <div className="flex items-center justify-between w-full gap-4 flex-wrap">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {hasImage && !currentImageError && (
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  Image
                </span>
              )}
              {hasVideo && (
                <span className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  Video
                </span>
              )}
              {urlExpired && (
                <Badge variant="destructive" className="text-xs">
                  URL Expired
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasImage && currentMedia?.file_url && !currentImageError && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={currentMedia.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Image
                  </a>
                </Button>
              )}
              {hasVideo && currentMedia?.media_url && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={currentMedia.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Video
                  </a>
                </Button>
              )}
              <Button onClick={onClose} variant="secondary" size="sm">
                Close
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
