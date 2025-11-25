// components/smartlock/passwords/PasswordList.tsx

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
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  Info,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const PasswordList = forwardRef<PasswordListHandle, PasswordListProps>(
  ({ deviceId }, ref) => {
    const [passwords, setPasswords] = useState<TemporaryPassword[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
    const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(
      new Set()
    );
    const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
    const [showExpired, setShowExpired] = useState(false);
    const [deleteDialogId, setDeleteDialogId] = useState<number | null>(null);

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

    useImperativeHandle(
      ref,
      () => ({
        getAllPasswordIds: () => {
          const activeIds = visiblePasswordsList
            .filter((p) => !isExpired(p.invalid_time))
            .map((p) => p.id);
          return activeIds;
        },
        refresh: () => {
          fetchPasswords();
        },
      }),
      [passwords]
    );

    const handleDelete = async (passwordId: number) => {
      setDeleteDialogId(null);

      try {
        setDeletingIds((prev) => new Set(prev).add(passwordId));

        const response = await fetch(
          `/api/smartlock/passwords/temporary/${passwordId}?deviceId=${deviceId}`,
          { method: "DELETE" }
        );

        const data = await response.json();

        if (data.success) {
          setPasswords((prev) => prev.filter((p) => p.id !== passwordId));
          setTimeout(() => fetchPasswords(), 1500);
        } else {
          setDeletingIds((prev) => {
            const next = new Set(prev);
            next.delete(passwordId);
            return next;
          });
          fetchPasswords();
        }
      } catch (error) {
        console.error("Error deleting password:", error);
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(passwordId);
          return next;
        });
      }
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
        <Card>
          <CardContent className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      );
    }

    const visiblePasswordsList = passwords.filter((p) => {
      if (deletingIds.has(p.id)) return false;
      if (!showExpired && isExpired(p.invalid_time)) return false;
      return true;
    });

    const stats = {
      total: passwords.length,
      active: passwords.filter((p) => !isExpired(p.invalid_time)).length,
      expired: passwords.filter((p) => isExpired(p.invalid_time)).length,
    };

    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Temporary Passwords</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {formatTimeAgo(lastRefreshTime)}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="font-normal">
                    <Shield className="w-3 h-3 mr-1" />
                    {stats.active} Active
                  </Badge>
                  {stats.expired > 0 && (
                    <Badge variant="secondary" className="font-normal">
                      {stats.expired} Expired
                    </Badge>
                  )}
                </div>

                {stats.expired > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showExpired"
                      checked={showExpired}
                      onCheckedChange={(checked) =>
                        setShowExpired(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="showExpired"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Show Expired
                    </Label>
                  </div>
                )}

                <Button
                  onClick={fetchPasswords}
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
          </CardHeader>

          <CardContent>
            {stats.expired > 0 && showExpired && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>About Expired Passwords</AlertTitle>
                <AlertDescription className="text-xs">
                  Expired passwords cannot be deleted and are kept for audit
                  purposes. They are automatically inactive.
                </AlertDescription>
              </Alert>
            )}

            <AnimatePresence mode="wait">
              {visiblePasswordsList.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {stats.expired > 0 && !showExpired
                      ? `No active passwords. ${
                          stats.expired
                        } expired password${
                          stats.expired > 1 ? "s" : ""
                        } hidden.`
                      : "No temporary passwords found"}
                  </p>
                  {stats.expired > 0 && !showExpired && (
                    <Button
                      onClick={() => setShowExpired(true)}
                      variant="link"
                      className="mt-2"
                    >
                      Show {stats.expired} expired password
                      {stats.expired > 1 ? "s" : ""}
                    </Button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {visiblePasswordsList.map((password) => {
                    const expired = isExpired(password.invalid_time);
                    const active = isActive(
                      password.effective_time,
                      password.invalid_time
                    );
                    const isDeleting = deletingIds.has(password.id);

                    return (
                      <motion.div
                        key={password.id}
                        variants={item}
                        whileHover={{ scale: expired ? 1 : 1.01 }}
                        className={`p-4 rounded-lg border transition-all ${
                          expired
                            ? "bg-muted/50 border-muted"
                            : isDeleting
                            ? "opacity-50 animate-pulse"
                            : "hover:border-foreground/20"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Header */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">
                                {password.name || "Unnamed Password"}
                              </h3>

                              {isDeleting ? (
                                <Badge variant="outline" className="gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Deleting
                                </Badge>
                              ) : (
                                <>
                                  <Badge
                                    variant={
                                      expired
                                        ? "secondary"
                                        : active
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {expired
                                      ? "Expired"
                                      : active
                                      ? "Active"
                                      : "Scheduled"}
                                  </Badge>

                                  {password.phase &&
                                    password.phase > 0 &&
                                    password.phase !== 2 && (
                                      <Badge variant="outline">
                                        Phase {password.phase}
                                      </Badge>
                                    )}
                                </>
                              )}
                            </div>

                            {/* Password */}
                            {password.password && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  Code:
                                </span>
                                <code className="px-2 py-1 bg-muted rounded font-mono text-sm">
                                  {visiblePasswords.has(password.id)
                                    ? password.password
                                    : "•••••••"}
                                </code>
                                <Button
                                  onClick={() =>
                                    togglePasswordVisibility(password.id)
                                  }
                                  disabled={isDeleting}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  {visiblePasswords.has(password.id) ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            )}

                            {/* Dates */}
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  From: {formatDate(password.effective_time)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                <span
                                  className={expired ? "text-destructive" : ""}
                                >
                                  Until: {formatDate(password.invalid_time)}
                                </span>
                              </div>
                            </div>

                            {expired && (
                              <Alert>
                                <Info className="h-3 w-3" />
                                <AlertDescription className="text-xs">
                                  This password has expired and cannot be
                                  deleted.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>

                          {/* Delete Button */}
                          <Button
                            onClick={() => setDeleteDialogId(password.id)}
                            disabled={isDeleting || expired}
                            variant="outline"
                            size="icon"
                            className={expired ? "opacity-50" : ""}
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogId !== null}
          onOpenChange={(open) => !open && setDeleteDialogId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Password?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This password will be permanently
                removed from the system.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogId(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => deleteDialogId && handleDelete(deleteDialogId)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

PasswordList.displayName = "PasswordList";

export default PasswordList;
