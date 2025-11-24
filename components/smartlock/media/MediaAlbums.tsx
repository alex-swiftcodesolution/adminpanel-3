// components/smartlock/media/MediaAlbums.tsx

"use client";

import { useState, useEffect } from "react";
import { MEDIA_EVENT_TYPES } from "@/lib/tuya/constants";
import { AlbumItem, AlbumsResponse } from "@/lib/tuya/tuya-api-wrapper";
import {
  Image as ImageIcon,
  Video,
  Clock,
  Eye,
  AlertCircle,
  RefreshCw,
  X,
  Filter,
  Camera,
} from "lucide-react";

interface MediaAlbumsProps {
  deviceId: string;
}

export default function MediaAlbums({ deviceId }: MediaAlbumsProps) {
  const [albumsData, setAlbumsData] = useState<AlbumsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<AlbumItem | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [unsupported, setUnsupported] = useState(false);
  const [filterType, setFilterType] = useState<number | "all">("all");

  useEffect(() => {
    fetchAlbums();
    fetchViewCount();
  }, [deviceId]);

  const fetchAlbums = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/smartlock/media/albums?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.unsupported) {
        setUnsupported(true);
        setAlbumsData(null);
      } else if (data.success && data.data) {
        setAlbumsData(data.data);
        setUnsupported(false);
      } else {
        setAlbumsData(null);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchViewCount = async () => {
    try {
      const response = await fetch(
        `/api/smartlock/media/view-count?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.success || data.data) {
        setViewCount(data.data?.view_times || 0);
      }
    } catch (error) {
      // Silently fail - view count is optional
    }
  };

  const handleMediaClick = async (item: AlbumItem) => {
    setSelectedMedia(item);

    // Increment view count
    try {
      await fetch("/api/smartlock/media/view-count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      fetchViewCount();
    } catch (error) {
      // Silently fail
    }
  };

  const formatDate = (timestamp: number) => {
    // API returns seconds
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getEventTypeName = (type: number): string => {
    return MEDIA_EVENT_TYPES[type] || `Event ${type}`;
  };

  // Filter albums by event type
  const filteredAlbums =
    albumsData?.album_list?.filter((item) => {
      if (filterType === "all") return true;
      return item.event_type === filterType;
    }) || [];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Albums</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (unsupported) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Albums</h2>
        <div className="text-center py-12 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <p className="text-yellow-800 font-semibold mb-2 text-lg">
            Media Albums Not Available
          </p>
          <p className="text-yellow-700 text-sm max-w-md mx-auto">
            This feature requires a cloud storage subscription or a
            camera-enabled smart lock. Your current device or API permissions
            don&apos;t support this feature.
          </p>
          {albumsData?.order_code && (
            <p className="text-yellow-600 text-xs mt-3">
              Current plan: {albumsData.order_code}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Media Albums</h2>
          {albumsData?.album_list && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
              {albumsData.album_list.length} items
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewCount > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
              <Eye className="w-4 h-4" />
              <span>{viewCount} views</span>
            </div>
          )}
          <button
            onClick={fetchAlbums}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-600 ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Cloud Storage Info */}
      {albumsData?.order_code && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>Cloud Storage:</strong>{" "}
          {albumsData.order_code.replace(/_/g, " ")}
        </div>
      )}

      {/* Event Type Filter */}
      {albumsData?.event_types && albumsData.event_types.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-full text-sm ${
                filterType === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {albumsData.event_types.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filterType === type
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {getEventTypeName(type)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Albums Grid */}
      {!albumsData?.album_list || filteredAlbums.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">No media found</p>
          <p className="text-gray-400 text-sm mt-1">
            {filterType !== "all"
              ? "Try selecting a different filter"
              : "Media will appear here when captured"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAlbums.map((item, idx) => (
            <div
              key={`${item.upload_time}-${idx}`}
              onClick={() => handleMediaClick(item)}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-100"
            >
              {item.file_url ? (
                <img
                  src={item.file_url}
                  alt={`Media ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Event Type Badge */}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                  {getEventTypeName(item.event_type)}
                </span>
              </div>

              {/* Video Indicator */}
              {item.media_url && (
                <div className="absolute top-2 right-2">
                  <Video className="w-5 h-5 text-white drop-shadow-lg" />
                </div>
              )}

              {/* Time */}
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1 text-white text-xs">
                  <Clock className="w-3 h-3" />
                  <span className="truncate">
                    {formatDate(item.upload_time)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Event Info */}
            <div className="mb-4 text-center text-white">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {getEventTypeName(selectedMedia.event_type)}
              </span>
              <p className="mt-2 text-gray-300 text-sm">
                {formatDate(selectedMedia.upload_time)}
              </p>
            </div>

            {/* Media Content */}
            {selectedMedia.media_url ? (
              <video
                src={selectedMedia.media_url}
                poster={selectedMedia.file_url}
                controls
                autoPlay
                className="w-full h-auto rounded-lg max-h-[70vh]"
              />
            ) : selectedMedia.file_url ? (
              <img
                src={selectedMedia.file_url}
                alt="Selected media"
                className="w-full h-auto rounded-lg max-h-[70vh] object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
                <p className="text-gray-400">Media not available</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center justify-center gap-3">
              {selectedMedia.file_url && (
                <a
                  href={selectedMedia.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Open Image
                </a>
              )}
              {selectedMedia.media_url && (
                <a
                  href={selectedMedia.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Open Video
                </a>
              )}
              <button
                onClick={() => setSelectedMedia(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
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
