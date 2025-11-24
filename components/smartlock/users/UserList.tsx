// components/smartlock/users/UserList.tsx

"use client";

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Edit,
  Trash2,
  User,
  RefreshCw,
  Info,
  Users as UsersIcon,
  Key,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface DeviceUser {
  user_id: string;
  device_id: string;
  nick_name: string;
  sex: 0 | 1 | 2;
  contact: string;
  birthday?: number;
  height: number;
  weight: number;
}

interface UserListProps {
  deviceId: string;
  onEdit?: (user: DeviceUser) => void;
}

export interface UserListHandle {
  refresh: () => void;
}

const UserList = forwardRef<UserListHandle, UserListProps>(
  ({ deviceId, onEdit }, ref) => {
    const router = useRouter();
    const [users, setUsers] = useState<DeviceUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

    const fetchUsers = useCallback(async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/smartlock/users?deviceId=${deviceId}&type=device`
        );
        const data = await response.json();

        if (data.success) {
          setUsers(data.data);
          setLastRefreshTime(new Date());
          console.log(`👥 Users loaded: ${data.data.length}`);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }, [deviceId]);

    useEffect(() => {
      fetchUsers();
    }, [fetchUsers]);

    useImperativeHandle(
      ref,
      () => ({
        refresh: () => {
          console.log("🔄 Manual refresh triggered");
          fetchUsers();
        },
      }),
      [fetchUsers]
    );

    const handleDelete = async (userId: string, userName: string) => {
      if (
        !confirm(
          `Are you sure you want to delete "${userName}"?\n\nThis will remove the user from the device.`
        )
      )
        return;

      try {
        setDeletingIds((prev) => new Set(prev).add(userId));

        console.log("🗑️ Deleting user:", userId);

        const response = await fetch(
          `/api/smartlock/users/${userId}?deviceId=${deviceId}`,
          { method: "DELETE" }
        );

        const data = await response.json();

        if (data.success) {
          console.log("✅ User deleted successfully");

          setUsers((prev) => prev.filter((u) => u.user_id !== userId));

          setTimeout(() => {
            console.log("🔄 Refreshing user list...");
            fetchUsers();
          }, 1500);
        } else {
          setDeletingIds((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
          alert("Failed to delete user: " + data.error);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        alert("Failed to delete user");
      }
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

    const getGenderLabel = (sex: 0 | 1 | 2) => {
      const labels = { 0: "Unknown", 1: "Male", 2: "Female" };
      return labels[sex] || "Unknown";
    };

    const getGenderIcon = (sex: 0 | 1 | 2) => {
      if (sex === 1) return "♂️";
      if (sex === 2) return "♀️";
      return "👤";
    };

    if (loading && users.length === 0) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-neutral-200">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    const visibleUsers = users.filter((u) => !deletingIds.has(u.user_id));

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Device Users
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Last updated: {formatTimeAgo(lastRefreshTime)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="h-8 px-3 font-normal border-neutral-200"
            >
              <UsersIcon className="mr-2 h-3 w-3" />
              <span className="text-xs">
                {visibleUsers.length} user{visibleUsers.length !== 1 ? "s" : ""}
              </span>
            </Badge>

            <Button
              onClick={() => fetchUsers()}
              disabled={loading}
              variant="outline"
              size="sm"
              className="h-8 border-neutral-200"
            >
              <RefreshCw
                className={`mr-2 h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <Separator className="bg-neutral-200" />

        {/* User Grid */}
        {visibleUsers.length === 0 ? (
          <Card className="border-neutral-200">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-neutral-300 mb-3" />
              <p className="text-sm text-neutral-500">No users found</p>
              <p className="text-xs text-neutral-400 mt-1">
                Users must be enrolled directly on the lock device
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleUsers.map((user) => {
              const isDeleting = deletingIds.has(user.user_id);

              return (
                <Card
                  key={user.user_id}
                  className={`border-neutral-200 hover:border-neutral-400 transition-all ${
                    isDeleting ? "opacity-50 border-red-300" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    {/* User Avatar & Name */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center text-xl">
                          {getGenderIcon(user.sex)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            {user.nick_name || "Unnamed User"}
                          </h3>
                          <p className="text-xs text-neutral-500 font-mono">
                            ID: {user.user_id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="text-xs">Gender:</span>
                        <Badge
                          variant="secondary"
                          className="h-5 px-2 text-xs font-normal bg-neutral-100 text-neutral-700"
                        >
                          {getGenderLabel(user.sex)}
                        </Badge>
                      </div>

                      {user.contact && (
                        <div className="flex items-center gap-2 text-xs text-neutral-600">
                          <span>Contact:</span>
                          <span className="font-medium">{user.contact}</span>
                        </div>
                      )}

                      {user.height > 0 && (
                        <div className="flex items-center gap-2 text-xs text-neutral-600">
                          <span>Height:</span>
                          <span className="font-medium">{user.height} cm</span>
                        </div>
                      )}

                      {user.weight > 0 && (
                        <div className="flex items-center gap-2 text-xs text-neutral-600">
                          <span>Weight:</span>
                          <span className="font-medium">
                            {(user.weight / 1000).toFixed(1)} kg
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator className="my-4 bg-neutral-100" />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          router.push(
                            `/dashboard/${deviceId}/users/${user.user_id}/unlock-methods`
                          )
                        }
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs border-neutral-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                        disabled={isDeleting}
                      >
                        <Key className="mr-2 h-3 w-3" />
                        Methods
                      </Button>

                      <Button
                        onClick={() => onEdit?.(user)}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs border-neutral-200 hover:bg-neutral-50"
                        disabled={isDeleting}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>

                      <Button
                        onClick={() =>
                          handleDelete(user.user_id, user.nick_name)
                        }
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs border-neutral-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        disabled={isDeleting}
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Banner */}
        <Card className="border-neutral-200 bg-neutral-50/50">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-700">
                About Device Users
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                Users must enroll their unlock methods (fingerprint, card,
                password, etc.) directly on the lock device. This interface
                manages user profiles and their assigned unlock methods.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

UserList.displayName = "UserList";

export default UserList;
