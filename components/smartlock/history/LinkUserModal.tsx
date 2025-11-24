/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/history/LinkUserModal.tsx

"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface LinkUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
  recordId: string;
  recordType: "unlock" | "alarm";
  currentUserId?: string;
  currentUserName?: string;
  onSuccess?: () => void;
}

interface UserItem {
  user_id: string;
  nick_name: string;
  sex?: number;
  contact?: string;
}

export default function LinkUserModal({
  isOpen,
  onClose,
  deviceId,
  recordId,
  recordType,
  currentUserId,
  currentUserName,
  onSuccess,
}: LinkUserModalProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    currentUserId || ""
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedUserId(currentUserId || "");
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, deviceId, currentUserId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/smartlock/users?deviceId=${deviceId}&type=device`
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedUserId) {
      setError("Please select a user");
      return;
    }

    try {
      setLinking(true);
      setError(null);

      const response = await fetch("/api/smartlock/history/link-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          recordId,
          userId: selectedUserId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const linkedUser = users.find((u) => u.user_id === selectedUserId);
        setSuccess(
          `Record linked to ${linkedUser?.nick_name || "user"} successfully!`
        );

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setError(data.error || "Failed to link user");
      }
    } catch (err: any) {
      console.error("Error linking user:", err);
      setError(err.message);
    } finally {
      setLinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Link Record to User
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Record Info */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Record Type:</span>{" "}
              <span className="capitalize">{recordType}</span>
            </p>
            <p className="text-gray-600 mt-1">
              <span className="font-medium">Record ID:</span>{" "}
              <span className="font-mono text-xs">
                {recordId.slice(0, 20)}...
              </span>
            </p>
            {currentUserName && (
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Currently Linked:</span>{" "}
                {currentUserName}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* User Selection */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No users found</p>
              <p className="text-gray-400 text-sm mt-1">
                Create users first to link records
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select User
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {users.map((user) => (
                  <label
                    key={user.user_id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedUserId === user.user_id ? "bg-blue-50" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="user"
                      value={user.user_id}
                      checked={selectedUserId === user.user_id}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {user.nick_name || "Unnamed User"}
                      </p>
                      {user.contact && (
                        <p className="text-sm text-gray-500">{user.contact}</p>
                      )}
                    </div>
                    {user.sex && (
                      <span className="text-xs text-gray-400">
                        {user.sex === 1 ? "Male" : "Female"}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={linking}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLink}
            disabled={linking || !selectedUserId || users.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {linking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Linking...
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" />
                Link User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
