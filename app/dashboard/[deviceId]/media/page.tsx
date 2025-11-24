// app/dashboard/[deviceId]/media/page.tsx

"use client";

import LatestMedia from "@/components/smartlock/media/LatestMedia";
import MediaAlbums from "@/components/smartlock/media/MediaAlbums";
import { Image as ImageIcon } from "lucide-react";
import { use } from "react";

interface PageProps {
  params: Promise<{ deviceId: string }>;
}

export default function MediaPage({ params }: PageProps) {
  const { deviceId } = use(params);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <ImageIcon className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Media Management
            </h1>
            <p className="text-gray-500">Device ID: {deviceId}</p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Latest Media */}
          <div className="lg:col-span-1">
            <LatestMedia deviceId={deviceId} />
          </div>

          {/* Right column - Albums */}
          <div className="lg:col-span-2">
            <MediaAlbums deviceId={deviceId} />
          </div>
        </div>
      </div>
    </div>
  );
}
