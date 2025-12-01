"use client";

import { useState, useEffect } from "react";
import { MEDIA_EVENT_TYPES } from "@/lib/tuya/constants";
import { AlbumItem, AlbumsResponse } from "@/lib/tuya/tuya-api-wrapper";
import {
  Image as ImageIcon,
  Video,
  Clock,
  RefreshCw,
  X,
  Filter,
  Camera,
} from "lucide-react";
import Image from "next/image";

interface MediaAlbumsProps {
  deviceId: string;
}

export default function MediaAlbums({ deviceId }: MediaAlbumsProps) {
  const [albumsData, setAlbumsData] = useState<AlbumsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<AlbumItem | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [filterType, setFilterType] = useState<number | "all">("all");

  useEffect(() => {
    fetchAlbums();
    fetchViewCount();
  }, [deviceId]);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/smartlock/media/albums?deviceId=${deviceId}`
      );
      const data = await res.json();
      setAlbumsData(data.success ? data.data : null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchViewCount = async () => {
    try {
      const res = await fetch(
        `/api/smartlock/media/view-count?deviceId=${deviceId}`
      );
      const data = await res.json();
      setViewCount(data.data?.view_times || 0);
    } catch {}
  };

  const handleMediaClick = async (item: AlbumItem) => {
    setSelectedMedia(item);
    try {
      await fetch("/api/smartlock/media/view-count", {
        method: "POST",
        body: JSON.stringify({ deviceId }),
        headers: { "Content-Type": "application/json" },
      });
      fetchViewCount();
    } catch {}
  };

  const formatDate = (ts: number) => new Date(ts * 1000).toLocaleString();
  const getEventName = (t: number) => MEDIA_EVENT_TYPES[t] || `Event ${t}`;

  const filtered =
    albumsData?.album_list?.filter(
      (i) => filterType === "all" || i.event_type === filterType
    ) || [];

  if (loading)
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 py-16 text-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-purple-600 mx-auto" />
      </div>
    );
  if (!albumsData?.album_list?.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center py-16 text-gray-500">
        <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="font-medium text-lg">No media yet</p>
        <p className="text-sm mt-1">
          Photos and videos will appear here when captured
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Media Albums</h2>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            {albumsData.album_list.length} items
          </span>
        </div>
        <button
          onClick={fetchAlbums}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {albumsData.order_code && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          Plan: {albumsData.order_code.replace(/_/g, " ")}
        </div>
      )}

      {albumsData.event_types?.length > 0 && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500" />
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 rounded-full text-sm ${
              filterType === "all" ? "bg-purple-600 text-white" : "bg-gray-100"
            }`}
          >
            All
          </button>
          {albumsData.event_types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-full text-sm ${
                filterType === t ? "bg-purple-600 text-white" : "bg-gray-100"
              }`}
            >
              {getEventName(t)}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item, i) => {
          const thumbUrl =
            item.file_url && item.file_key
              ? `/api/proxy/image?url=${encodeURIComponent(
                  item.file_url
                )}&key=${item.file_key}`
              : null;

          return (
            <button
              key={i}
              onClick={() => handleMediaClick(item)}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
            >
              {thumbUrl ? (
                <Image
                  width={300}
                  height={300}
                  src={thumbUrl}
                  alt="Thumb"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {item.media_url ? (
                    <Video className="w-10 h-10 text-gray-400" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  )}
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                  {getEventName(item.event_type)}
                </span>
              </div>
              {item.media_url && (
                <Video className="absolute top-2 right-2 w-6 h-6 text-white drop-shadow-lg" />
              )}
              <div className="absolute bottom-2 left-2 right-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(item.upload_time)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Full View Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center text-white mb-4">
              <span className="px-4 py-1 bg-white/20 rounded-full text-sm">
                {getEventName(selectedMedia.event_type)}
              </span>
              <p className="mt-2 text-gray-300 text-sm">
                {formatDate(selectedMedia.upload_time)}
              </p>
            </div>

            {selectedMedia.media_url ? (
              <video
                src={selectedMedia.media_url}
                controls
                autoPlay
                className="w-full rounded-lg max-h-[75vh]"
              />
            ) : selectedMedia.file_url && selectedMedia.file_key ? (
              <Image
                width={500}
                height={500}
                src={`/api/proxy/image?url=${encodeURIComponent(
                  selectedMedia.file_url
                )}&key=${selectedMedia.file_key}`}
                alt="Full size"
                className="w-full rounded-lg max-h-[75vh] object-contain bg-black"
              />
            ) : null}

            <div className="mt-4 flex justify-center gap-3">
              {selectedMedia.file_url && selectedMedia.file_key && (
                <a
                  href={`/api/proxy/image?url=${encodeURIComponent(
                    selectedMedia.file_url
                  )}&key=${selectedMedia.file_key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Open Full Size
                </a>
              )}
              <button
                onClick={() => setSelectedMedia(null)}
                className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
