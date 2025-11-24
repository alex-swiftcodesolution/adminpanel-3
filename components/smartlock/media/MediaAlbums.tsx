// components/smartlock/media/MediaAlbums.tsx

"use client";

import { useState, useEffect } from "react";
import { Album, MediaInfo } from "@/lib/tuya/tuya-api-wrapper";
import {
  Image as ImageIcon,
  Video,
  Clock,
  Eye,
  AlertCircle,
} from "lucide-react";

interface MediaAlbumsProps {
  deviceId: string;
}

export default function MediaAlbums({ deviceId }: MediaAlbumsProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaInfo | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [unsupported, setUnsupported] = useState(false);

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
      } else if (data.success) {
        setAlbums(data.data || []);
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
      console.error("Error fetching view count:", error);
    }
  };

  const handleMediaClick = async (media: MediaInfo) => {
    setSelectedMedia(media);

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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Media Albums</h2>
        </div>
        <div className="text-center py-12 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <p className="text-yellow-800 font-semibold mb-2 text-lg">
            Media Albums Not Available
          </p>
          <p className="text-yellow-700 text-sm max-w-md mx-auto">
            This feature requires a video doorbell or camera-enabled smart lock.
            Your current device or API permissions don't support media features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Media Albums</h2>
        {viewCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg">
            <Eye className="w-5 h-5" />
            <span className="font-semibold">{viewCount} views</span>
          </div>
        )}
      </div>

      {albums.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No albums found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {albums.map((album) => (
            <div
              key={album.album_id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">{formatDate(album.time)}</span>
                <span className="ml-auto text-sm text-gray-500">
                  {album.media_list.length} items
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {album.media_list.map((media, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleMediaClick(media)}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={`Media ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <Video className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white font-semibold">
                        View
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt="Selected media"
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full h-auto rounded-lg"
              />
            )}
            <div className="mt-4 text-center">
              <button
                onClick={() => setSelectedMedia(null)}
                className="px-6 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
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
