/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/media/LatestMedia.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Video,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Camera,
} from "lucide-react";

interface MediaUrlResponse {
  file_url?: string;
  file_key?: string;
  bucket?: string;
  file_path?: string;
  media_url?: string;
  media_key?: string;
  media_path?: string;
  media_bucket?: string;
}

interface LatestMediaProps {
  deviceId: string;
}

export default function LatestMedia({ deviceId }: LatestMediaProps) {
  const [media, setMedia] = useState<MediaUrlResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const [fileType, setFileType] = useState<1 | 2>(2); // 1 = remote unlock, 2 = alarm

  useEffect(() => {
    fetchLatestMedia();
  }, [deviceId, fileType]);

  const fetchLatestMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/smartlock/media/latest?deviceId=${deviceId}&fileType=${fileType}`
      );
      const data = await response.json();

      if (data.unsupported) {
        setUnsupported(true);
        setMedia(null);
      } else if (data.success && data.data) {
        // Check if media actually exists (not empty strings)
        const hasMedia = data.data.file_url && data.data.file_url.length > 0;
        setMedia(hasMedia ? data.data : null);
        setUnsupported(false);
      } else {
        setMedia(null);
      }
    } catch (err: any) {
      console.error("Error fetching latest media:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Construct full URL if needed
  const getFullUrl = (media: MediaUrlResponse): string | null => {
    if (media.file_url && media.file_url.includes("http")) {
      // Check if it's a complete URL with path
      if (media.file_path && !media.file_url.includes(media.file_path)) {
        return `${media.file_url}${media.file_path}`;
      }
      return media.file_url;
    }
    return null;
  };

  const getVideoUrl = (media: MediaUrlResponse): string | null => {
    if (media.media_url && media.media_url.includes("http")) {
      if (media.media_path && !media.media_url.includes(media.media_path)) {
        return `${media.media_url}${media.media_path}`;
      }
      return media.media_url;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Latest Capture
        </h3>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (unsupported) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Latest Capture
        </h3>
        <div className="text-center py-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-yellow-800 font-semibold mb-2">
            Media Feature Not Available
          </p>
          <p className="text-yellow-700 text-sm px-4">
            Your device or plan doesn&apos;t support media capture features.
          </p>
        </div>
      </div>
    );
  }

  const imageUrl = media ? getFullUrl(media) : null;
  const videoUrl = media ? getVideoUrl(media) : null;
  const hasContent = imageUrl || videoUrl;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Latest Capture</h3>
        <button
          onClick={fetchLatestMedia}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFileType(2)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            fileType === 2
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Alarm
        </button>
        <button
          onClick={() => setFileType(1)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            fileType === 1
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Remote Unlock
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!hasContent ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">No media available</p>
          <p className="text-gray-400 text-sm mt-1">
            {fileType === 2
              ? "No alarm captures recorded"
              : "No remote unlock captures recorded"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          {imageUrl && (
            <div className="relative rounded-lg overflow-hidden bg-gray-900">
              <img
                src={imageUrl}
                alt="Latest capture"
                className="w-full h-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 bg-black/70 text-white rounded-full text-sm flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  Image
                </span>
              </div>
            </div>
          )}

          {/* Video Preview */}
          {videoUrl && (
            <div className="relative rounded-lg overflow-hidden bg-gray-900">
              <video
                src={videoUrl}
                controls
                className="w-full h-auto"
                poster={imageUrl || undefined}
              />
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 bg-black/70 text-white rounded-full text-sm flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  Video
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Open Image
              </a>
            )}
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Open Video
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
