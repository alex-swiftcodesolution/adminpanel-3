/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/history/MediaPreviewModal.tsx

"use client";

import { useState, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  Video,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MediaInfoItem } from "@/lib/tuya/tuya-api-wrapper";
import { MEDIA_EVENT_TYPES } from "@/lib/tuya/constants";

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

  useEffect(() => {
    if (isOpen && mediaInfos.length > 0) {
      setCurrentIndex(0);
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
            media.file_url.includes("?q-sign"));

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

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % resolvedUrls.length);
  };

  const goPrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + resolvedUrls.length) % resolvedUrls.length
    );
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasMultiple) goPrev();
      if (e.key === "ArrowRight" && hasMultiple) goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasMultiple]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {title || "Media Preview"}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
              {eventType !== undefined && MEDIA_EVENT_TYPES[eventType] && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  {MEDIA_EVENT_TYPES[eventType]}
                </span>
              )}
              {timestamp && <span>{formatDate(timestamp)}</span>}
              {hasMultiple && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                  {currentIndex + 1} / {resolvedUrls.length}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative bg-gray-900 flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-white">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>Loading media...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-red-400 p-4 text-center">
              <AlertCircle className="w-8 h-8" />
              <p>{error}</p>
              <button
                onClick={resolveMediaUrls}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          ) : resolvedUrls.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-gray-400 p-4">
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
                  <button
                    onClick={goPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 z-10 transition-colors"
                    title="Previous (←)"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 z-10 transition-colors"
                    title="Next (→)"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
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
                    className="max-w-full max-h-[55vh] rounded-lg shadow-lg"
                  >
                    Your browser does not support video playback.
                  </video>
                ) : hasImage ? (
                  <img
                    key={currentMedia.file_url}
                    src={currentMedia.file_url}
                    alt="Media preview"
                    className="max-w-full max-h-[55vh] rounded-lg shadow-lg object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      setError("Failed to load image");
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
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
          <div className="flex items-center gap-2 p-3 border-t border-gray-200 overflow-x-auto bg-gray-50 flex-shrink-0">
            {resolvedUrls.map((media, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {media.file_url ? (
                  <img
                    src={media.file_url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    {media.media_url ? (
                      <Video className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {hasImage && (
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
          </div>

          <div className="flex items-center gap-2">
            {hasImage && currentMedia?.file_url && (
              <a
                href={currentMedia.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Image
              </a>
            )}
            {hasVideo && currentMedia?.media_url && (
              <a
                href={currentMedia.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Video
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
