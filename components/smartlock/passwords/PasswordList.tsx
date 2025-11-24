// components/smartlock/passwords/PasswordList.tsx

"use client";

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  Filter,
  Info,
} from "lucide-react";

interface TemporaryPassword {
  id: number;
  name: string;
  password?: string;
  effective_time: number;
  invalid_time: number;
  phase?: number;
  phone?: string;
  sn?: number;
  time_zone?: string;
  type?: number;
  status?: number;
}

interface PasswordListProps {
  deviceId: string;
}

export interface PasswordListHandle {
  getAllPasswordIds: () => number[];
  refresh: () => void;
}

const PasswordList = forwardRef<PasswordListHandle, PasswordListProps>(
  ({ deviceId }, ref) => {
    const [passwords, setPasswords] = useState<TemporaryPassword[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
    const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(
      new Set()
    );
    const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
    const [showExpired, setShowExpired] = useState(false); // ✅ Default: hide expired

    const fetchPasswords = useCallback(async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/smartlock/passwords/temporary?deviceId=${deviceId}`
        );
        const data = await response.json();

        if (data.success) {
          setPasswords(data.data);
          setLastRefreshTime(new Date());
          console.log(`📋 Passwords loaded: ${data.data.length} total`);
        }
      } catch (error) {
        console.error("Error fetching passwords:", error);
      } finally {
        setLoading(false);
      }
    }, [deviceId]);

    useEffect(() => {
      fetchPasswords();
    }, [fetchPasswords]);

    // ✅ Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getAllPasswordIds: () => {
          // Only return IDs of non-expired, non-deleting passwords
          const activeIds = visiblePasswordsList
            .filter((p) => !isExpired(p.invalid_time))
            .map((p) => p.id);
          console.log(
            `📋 Getting active password IDs: ${activeIds.length} found`,
            activeIds
          );
          return activeIds;
        },
        refresh: () => {
          console.log("🔄 Manual refresh triggered");
          fetchPasswords();
        },
      }),
      [passwords]
    );

    const handleDelete = async (passwordId: number) => {
      if (!confirm("Are you sure you want to delete this password?")) return;

      try {
        setDeletingIds((prev) => new Set(prev).add(passwordId));

        const response = await fetch(
          `/api/smartlock/passwords/temporary/${passwordId}?deviceId=${deviceId}`,
          { method: "DELETE" }
        );

        const data = await response.json();

        if (data.success) {
          console.log("✅ Password deleted successfully");
          setPasswords((prev) => prev.filter((p) => p.id !== passwordId));
          setTimeout(() => fetchPasswords(), 1500);
        } else {
          setDeletingIds((prev) => {
            const next = new Set(prev);
            next.delete(passwordId);
            return next;
          });

          if (data.error?.includes("expired")) {
            alert(
              "⚠️ This password has expired and cannot be deleted.\n\nExpired passwords are kept for audit purposes."
            );
          } else {
            alert("Failed to delete password: " + data.error);
          }

          fetchPasswords();
        }
      } catch (error) {
        console.error("Error deleting password:", error);
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(passwordId);
          return next;
        });
        alert("Failed to delete password");
      }
    };

    const handleForceRefresh = () => {
      console.log("🔄 Force refresh triggered");
      fetchPasswords();
    };

    const togglePasswordVisibility = (passwordId: number) => {
      const newVisible = new Set(visiblePasswords);
      if (newVisible.has(passwordId)) {
        newVisible.delete(passwordId);
      } else {
        newVisible.add(passwordId);
      }
      setVisiblePasswords(newVisible);
    };

    const formatDate = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleString();
    };

    const formatTimeAgo = (date: Date) => {
      const seconds = Math.floor(
        (new Date().getTime() - date.getTime()) / 1000
      );
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      return date.toLocaleTimeString();
    };

    const isExpired = (invalidTime: number) => {
      return Date.now() > invalidTime * 1000;
    };

    const isActive = (effectiveTime: number, invalidTime: number) => {
      const now = Date.now();
      return now >= effectiveTime * 1000 && now < invalidTime * 1000;
    };

    if (loading && passwords.length === 0) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // ✅ Frontend filtering: Remove deleting passwords, optionally hide expired
    const visiblePasswordsList = passwords.filter((p) => {
      if (deletingIds.has(p.id)) return false;
      if (!showExpired && isExpired(p.invalid_time)) return false;
      return true;
    });

    // ✅ Calculate stats
    const stats = {
      total: passwords.length,
      active: passwords.filter((p) => !isExpired(p.invalid_time)).length,
      expired: passwords.filter((p) => isExpired(p.invalid_time)).length,
    };

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Temporary Passwords
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {formatTimeAgo(lastRefreshTime)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* ✅ Stats Display */}
            <div className="text-sm text-gray-600 flex items-center gap-4">
              <span className="font-medium text-green-600">
                {stats.active} Active
              </span>
              {stats.expired > 0 && (
                <span className="font-medium text-orange-600">
                  {stats.expired} Expired
                </span>
              )}
            </div>

            {/* ✅ Show/Hide Expired Toggle */}
            {stats.expired > 0 && (
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={showExpired}
                  onChange={(e) => setShowExpired(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  Show Expired ({stats.expired})
                </span>
              </label>
            )}

            {/* Refresh Button */}
            <button
              onClick={handleForceRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Force refresh from server"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ✅ Info Banner for Expired Passwords */}
        {stats.expired > 0 && showExpired && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">
                About Expired Passwords
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Expired passwords cannot be deleted and are kept for audit
                purposes. They are automatically inactive and won&apos;t work on
                the lock.
              </p>
            </div>
            <button
              onClick={() => setShowExpired(false)}
              className="text-xs text-orange-600 hover:text-orange-800 underline"
            >
              Hide
            </button>
          </div>
        )}

        {/* Password List */}
        {visiblePasswordsList.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {stats.expired > 0 && !showExpired
                ? `No active passwords. ${stats.expired} expired password${
                    stats.expired > 1 ? "s" : ""
                  } hidden.`
                : "No temporary passwords found"}
            </p>
            {stats.expired > 0 && !showExpired && (
              <button
                onClick={() => setShowExpired(true)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Show {stats.expired} expired password
                {stats.expired > 1 ? "s" : ""}
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {visiblePasswordsList.map((password) => {
              const expired = isExpired(password.invalid_time);
              const active = isActive(
                password.effective_time,
                password.invalid_time
              );
              const isDeleting = deletingIds.has(password.id);

              return (
                <div
                  key={password.id}
                  data-password-id={password.id}
                  className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all ${
                    expired
                      ? "border-orange-200 bg-orange-50/30" // ✅ Different style for expired
                      : isDeleting
                      ? "opacity-50 border-red-300 bg-red-50"
                      : active
                      ? "border-green-200"
                      : "border-gray-200"
                  } ${isDeleting ? "animate-pulse" : "hover:shadow-md"}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {password.name || "Unnamed Password"}
                        </h3>

                        {isDeleting ? (
                          <span className="px-2 py-1 text-xs rounded-full font-medium bg-red-100 text-red-700 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Deleting...
                          </span>
                        ) : (
                          <>
                            {/* ✅ Status Badge */}
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${
                                expired
                                  ? "bg-orange-100 text-orange-700 border border-orange-300"
                                  : active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {expired
                                ? "⚠️ Expired"
                                : active
                                ? "✅ Active"
                                : "⏰ Scheduled"}
                            </span>

                            {password.phase &&
                              password.phase > 0 &&
                              password.phase !== 2 && (
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                                  Phase {password.phase}
                                </span>
                              )}
                          </>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        {password.password && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              Password:
                            </span>
                            <code className="px-2 py-1 bg-gray-100 rounded font-mono text-sm">
                              {visiblePasswords.has(password.id)
                                ? password.password
                                : "••••••••"}
                            </code>
                            <button
                              onClick={() =>
                                togglePasswordVisibility(password.id)
                              }
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              disabled={isDeleting}
                            >
                              {visiblePasswords.has(password.id) ? (
                                <EyeOff className="w-4 h-4 text-gray-500" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Valid from: {formatDate(password.effective_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock
                              className={`w-4 h-4 ${
                                expired ? "text-orange-500" : ""
                              }`}
                            />
                            <span
                              className={
                                expired ? "text-orange-600 font-medium" : ""
                              }
                            >
                              Valid until: {formatDate(password.invalid_time)}
                            </span>
                          </div>
                          {password.sn && (
                            <p className="text-xs text-gray-400">
                              SN: {password.sn}
                            </p>
                          )}
                        </div>

                        {/* ✅ Expired Warning */}
                        {expired && (
                          <div className="mt-3 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                            <p className="text-xs text-orange-800 flex items-start gap-2">
                              <Info className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>
                                This password has expired and is no longer
                                functional. It cannot be deleted and is kept for
                                record-keeping purposes.
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ✅ Delete Button */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleDelete(password.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          expired
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:bg-red-50"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={
                          expired
                            ? "Cannot delete expired password - kept for audit records"
                            : isDeleting
                            ? "Deleting..."
                            : "Delete password"
                        }
                        disabled={isDeleting || expired}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ✅ Expired Label on Button Area */}
                  {expired && (
                    <div className="mt-2 text-right">
                      <span className="text-xs text-orange-600 font-medium">
                        Cannot delete expired password
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

PasswordList.displayName = "PasswordList";

export default PasswordList;
