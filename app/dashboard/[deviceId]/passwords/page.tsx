// app/dashboard/[deviceId]/passwords/page.tsx

"use client";

import { use, useState, useRef } from "react";
import PasswordList, {
  PasswordListHandle,
} from "@/components/smartlock/passwords/PasswordList";
import CreatePasswordForm from "@/components/smartlock/passwords/CreatePasswordForm";
import { Key, Trash2, AlertTriangle } from "lucide-react";

interface PasswordsPageProps {
  params: Promise<{ deviceId: string }>;
}

export default function PasswordsPage({ params }: PasswordsPageProps) {
  const { deviceId } = use(params);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const passwordListRef = useRef<PasswordListHandle>(null); // ✅ Properly typed

  const handlePasswordCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteAllIndividually = async () => {
    console.log("🗑️ Delete All clicked");

    // ✅ Get password IDs from ref
    const passwordIds = passwordListRef.current?.getAllPasswordIds() || [];

    console.log(`📋 Found ${passwordIds.length} password IDs:`, passwordIds);

    if (passwordIds.length === 0) {
      alert("No passwords to delete!");
      return;
    }

    if (
      !confirm(
        `⚠️ This will delete ALL ${passwordIds.length} password${
          passwordIds.length > 1 ? "s" : ""
        } one by one.\n\n` +
          `This may take approximately ${passwordIds.length * 2} seconds.\n\n` +
          `Continue?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < passwordIds.length; i++) {
      const id = passwordIds[i];
      try {
        console.log(
          `🗑️ Deleting password ${id} (${i + 1}/${passwordIds.length})...`
        );

        const response = await fetch(
          `/api/smartlock/passwords/temporary/${id}?deviceId=${deviceId}`,
          { method: "DELETE" }
        );

        const data = await response.json();

        if (data.success) {
          successCount++;
          console.log(
            `✅ Deleted ${id} (${successCount}/${passwordIds.length})`
          );
        } else {
          failCount++;
          console.log(`❌ Failed to delete ${id}: ${data.error}`);
        }

        // Wait 1.5 seconds between deletions to avoid rate limiting
        if (i < passwordIds.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      } catch (error) {
        failCount++;
        console.error(`❌ Error deleting ${id}:`, error);
      }
    }

    setIsDeleting(false);

    // Refresh the list
    passwordListRef.current?.refresh();

    alert(
      `🎉 Deletion complete!\n\n` +
        `✅ Successfully deleted: ${successCount}\n` +
        `❌ Failed: ${failCount}\n\n` +
        `The list will refresh now.`
    );
  };

  const handleClearAll = async () => {
    if (
      !confirm(
        "⚠️ Trying Tuya's 'Clear All' API...\n\n" +
          "Note: This API may not work for this device type.\n\n" +
          "If it fails, use 'Delete All (Safe)' button instead."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/smartlock/passwords/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Clear All API returned success. Verifying in 3 seconds...");

        setTimeout(() => {
          passwordListRef.current?.refresh();
        }, 3000);
      } else {
        alert("❌ Clear All failed: " + data.error);
      }
    } catch (error) {
      console.error("Error clearing passwords:", error);
      alert("❌ Failed to clear passwords");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Password Management
              </h1>
              <p className="text-gray-500">Device ID: {deviceId}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDeleteAllIndividually}
              disabled={isDeleting}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete all passwords one by one (recommended)"
            >
              <Trash2 className="w-5 h-5" />
              {isDeleting ? "Deleting..." : "Delete All (Safe)"}
            </button>

            <button
              onClick={handleClearAll}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed opacity-60"
              title="⚠️ May not work for this device type"
            >
              <AlertTriangle className="w-5 h-5" />
              Clear All (API)
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <CreatePasswordForm
              deviceId={deviceId}
              onSuccess={handlePasswordCreated}
            />
          </div>

          <div className="lg:col-span-2">
            <PasswordList
              key={refreshKey}
              deviceId={deviceId}
              ref={passwordListRef} // ✅ Pass ref
            />
          </div>
        </div>
      </div>
    </div>
  );
}
