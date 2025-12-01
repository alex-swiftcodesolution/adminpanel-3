"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  RefreshCw,
  ExternalLink,
  Camera,
} from "lucide-react";
import Image from "next/image";

interface MediaUrlResponse {
  file_url?: string;
  file_key?: string;
  media_url?: string;
}

interface LatestMediaProps {
  deviceId: string;
}

export default function LatestMedia({ deviceId }: LatestMediaProps) {
  const [media, setMedia] = useState<MediaUrlResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileType, setFileType] = useState<1 | 2>(2); // 2 = alarm, 1 = remote unlock

  const fetchLatestMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/smartlock/media/latest?deviceId=${deviceId}&fileType=${fileType}`
      );
      const data = await res.json();
      setMedia(data.success && data.data?.file_url ? data.data : null);
    } catch (err) {
      console.error(err);
      setMedia(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestMedia();
  }, [deviceId, fileType]);

  const proxyImageUrl =
    media?.file_url && media?.file_key
      ? `/api/proxy/image?url=${encodeURIComponent(media.file_url)}&key=${
          media.file_key
        }`
      : null;

  const hasMedia = proxyImageUrl || media?.media_url;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Latest Capture</h3>
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (!hasMedia) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center py-12 text-gray-500">
        <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="font-medium">No capture yet</p>
        <p className="text-sm mt-1">
          {fileType === 2
            ? "Waiting for alarm event"
            : "Waiting for remote unlock"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Latest Capture</h3>
        <button
          onClick={fetchLatestMedia}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFileType(2)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            fileType === 2
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Alarm
        </button>
        <button
          onClick={() => setFileType(1)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            fileType === 1
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Remote Unlock
        </button>
      </div>

      {proxyImageUrl && (
        <div className="relative rounded-lg overflow-hidden bg-black mb-4">
          <Image
            width={500}
            height={500}
            src={proxyImageUrl}
            alt="Latest capture"
            className="w-full"
          />
          <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
            <ImageIcon className="w-4 h-4" /> Image
          </div>
        </div>
      )}

      {media?.media_url && (
        <video
          src={media.media_url}
          controls
          poster={proxyImageUrl || undefined}
          className="w-full rounded-lg mb-4"
        />
      )}

      <div className="flex justify-end">
        {proxyImageUrl && (
          <a
            href={proxyImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Full Size
          </a>
        )}
      </div>
    </div>
  );
}
