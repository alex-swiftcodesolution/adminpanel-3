// components/smartlock/media/LatestMedia.tsx

"use client";

import { useState, useEffect } from "react";
import { MediaInfo } from "@/lib/tuya/tuya-api-wrapper";
import {
  Image as ImageIcon,
  Video,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface LatestMediaProps {
  deviceId: string;
}

export default function LatestMedia({ deviceId }: LatestMediaProps) {
  const [media, setMedia] = useState<MediaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    fetchLatestMedia();
  }, [deviceId]);

  const fetchLatestMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/smartlock/media/latest?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.unsupported) {
        setUnsupported(true);
      } else if (data.success && data.data) {
        setMedia(data.data);
      }
    } catch (error) {
      console.error("Error fetching latest media:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (unsupported) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Latest Capture
        </h3>
        <div className="text-center py-12 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-yellow-800 font-semibold mb-2">
            Media Feature Not Available
          </p>
          <p className="text-yellow-700 text-sm">
            Your device or plan doesn't support media capture features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Latest Capture</h3>
        <button
          onClick={fetchLatestMedia}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {!media ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No media available</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-gray-900">
            {media.type === "image" ? (
              <img
                src={media.url}
                alt="Latest capture"
                className="w-full h-auto"
              />
            ) : (
              <video src={media.url} controls className="w-full h-auto" />
            )}
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 bg-black bg-opacity-70 text-white rounded-full text-sm flex items-center gap-1">
                {media.type === "image" ? (
                  <ImageIcon className="w-4 h-4" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                {media.type}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Captured: {formatDate(media.time)}</span>
            <a
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Open Full Size
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
