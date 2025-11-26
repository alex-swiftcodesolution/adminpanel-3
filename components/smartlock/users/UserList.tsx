// components/smartlock/users/UserList.tsx

"use client";

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Trash2,
  User,
  RefreshCw,
  Info,
  Users as UsersIcon,
  Key,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const UserList = forwardRef<UserListHandle, UserListProps>(
  ({ deviceId, onEdit }, ref) => {
    const router = useRouter();
    const [users, setUsers] = useState<DeviceUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
    const [deleteDialogUser, setDeleteDialogUser] = useState<DeviceUser | null>(
      null
    );

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
          fetchUsers();
        },
      }),
      [fetchUsers]
    );

    const handleDelete = async (userId: string) => {
      setDeleteDialogUser(null);

      try {
        setDeletingIds((prev) => new Set(prev).add(userId));

        const response = await fetch(
          `/api/smartlock/users/${userId}?deviceId=${deviceId}`,
          { method: "DELETE" }
        );

        const data = await response.json();

        if (data.success) {
          setUsers((prev) => prev.filter((u) => u.user_id !== userId));
          setTimeout(() => fetchUsers(), 1500);
        } else {
          setDeletingIds((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Device Users</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {formatTimeAgo(lastRefreshTime)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-normal">
                  <UsersIcon className="mr-2 h-3 w-3" />
                  {visibleUsers.length} user
                  {visibleUsers.length !== 1 ? "s" : ""}
                </Badge>

                <Button
                  onClick={() => fetchUsers()}
                  disabled={loading}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>

            <Separator className="mb-6" />

            <AnimatePresence mode="wait">
              {visibleUsers.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No users found
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Users must be enrolled directly on the lock device
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {visibleUsers.map((user) => {
                    const isDeleting = deletingIds.has(user.user_id);

                    return (
                      <motion.div
                        key={user.user_id}
                        variants={item}
                        whileHover={{ scale: isDeleting ? 1 : 1.02 }}
                      >
                        <Card
                          className={`h-full ${
                            isDeleting ? "opacity-50 animate-pulse" : ""
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xl">
                                  {getGenderIcon(user.sex)}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-sm">
                                    {user.nick_name || "Unnamed User"}
                                  </h3>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {user.user_id.slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {getGenderLabel(user.sex)}
                                </Badge>
                              </div>

                              {user.contact && (
                                <p className="text-xs text-muted-foreground">
                                  {user.contact}
                                </p>
                              )}

                              <div className="flex gap-2 text-xs text-muted-foreground">
                                {user.height > 0 && (
                                  <span>{user.height}cm</span>
                                )}
                                {user.weight > 0 && (
                                  <span>
                                    {(user.weight / 1000).toFixed(1)}kg
                                  </span>
                                )}
                              </div>
                            </div>

                            <Separator className="my-3" />

                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  router.push(
                                    `/dashboard/${deviceId}/users/${user.user_id}/unlock-methods`
                                  )
                                }
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                disabled={isDeleting}
                              >
                                <Key className="mr-1 h-3 w-3" />
                                Methods
                              </Button>

                              <Button
                                onClick={() => onEdit?.(user)}
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                disabled={isDeleting}
                              >
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                              </Button>

                              <Button
                                onClick={() => setDeleteDialogUser(user)}
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-1 h-3 w-3" />
                                )}
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>About Device Users</AlertTitle>
          <AlertDescription className="text-xs">
            Users must enroll their unlock methods (fingerprint, card, password,
            etc.) directly on the lock device. This interface manages user
            profiles and their assigned unlock methods.
          </AlertDescription>
        </Alert>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogUser !== null}
          onOpenChange={(open) => !open && setDeleteDialogUser(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;
                {deleteDialogUser?.nick_name}
                &quot;? This will remove the user from the device.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogUser(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  deleteDialogUser && handleDelete(deleteDialogUser.user_id)
                }
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

UserList.displayName = "UserList";

export default UserList;
