/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/unlock-methods/UnlockMethodsList.tsx

"use client";

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Key,
  Fingerprint,
  CreditCard,
  Smartphone,
  User,
  Lock,
  Shield,
  Hand,
  Eye,
  Radio,
  Info,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface UnlockMethodsListProps {
  deviceId: string;
  userId?: string;
  userType?: number;
  onEdit?: (method: any) => void;
  onDelete?: (method: any) => void;
  onAssign?: (method: any) => void;
  onUnbind?: (method: any) => void;
  onSettings?: (method: any) => void;
}

export interface UnlockMethodsListHandle {
  refresh: () => void;
}

const UnlockMethodsList = forwardRef<
  UnlockMethodsListHandle,
  UnlockMethodsListProps
>(
  (
    {
      deviceId,
      userId,
      userType,
      onEdit,
      onDelete,
      onAssign,
      onUnbind,
      onSettings,
    },
    ref
  ) => {
    const [methods, setMethods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

    const fetchMethods = useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        let url = `/api/smartlock/unlock-methods?deviceId=${deviceId}`;
        if (userId) url += `&userId=${userId}`;
        if (userType) url += `&userType=${userType}`;

        console.log("🔍 Fetching unlock methods from:", url);

        const response = await fetch(url);
        const data = await response.json();

        console.log("📦 API Response:", data);

        if (data.success && data.data) {
          setMethods(Array.isArray(data.data) ? data.data : []);
          setLastRefreshTime(new Date());
          console.log("✅ Methods loaded:", data.data.length);
        } else {
          setError(data.error || "Failed to load unlock methods");
          setMethods([]);
        }
      } catch (error: any) {
        console.error("❌ Error fetching unlock methods:", error);
        setError(error.message);
        setMethods([]);
      } finally {
        setLoading(false);
      }
    }, [deviceId, userId, userType]);

    useEffect(() => {
      fetchMethods();
    }, [fetchMethods]);

    useImperativeHandle(
      ref,
      () => ({
        refresh: () => {
          console.log("🔄 Manual refresh triggered");
          fetchMethods();
        },
      }),
      [fetchMethods]
    );

    const handleDelete = async (method: any) => {
      const methodName =
        method.unlock_name ||
        `${getMethodTypeName(method.unlock_type || method.dp_code)} #${
          method.unlock_sn || method.unlock_no
        }`;

      if (
        !confirm(
          `Are you sure you want to delete "${methodName}"?\n\nThis will permanently remove the unlock method from the device.`
        )
      )
        return;

      try {
        // ✅ Use unlock_sn as the identifier
        const methodId = method.unlock_sn || method.unlock_no;

        setDeletingIds((prev) => new Set(prev).add(methodId));

        console.log("🗑️ Deleting unlock method:", method);

        // ✅ Extract unlock_type from dp_code if needed
        let unlockType = method.unlock_type;
        if (!unlockType && method.dp_code) {
          unlockType = method.dp_code.replace("unlock_", "");
        }

        // ✅ For DELETE API, we need the actual unlock_no (slot number)
        // In detailed methods, this might not be available
        // But we have unlock_sn which we'll use
        const params = new URLSearchParams({
          deviceId,
          unlockType: unlockType,
          unlockNo: String(methodId), // ✅ Use unlock_sn as the number
        });

        if (userId) params.append("userId", userId);
        if (userType) params.append("userType", String(userType));

        console.log("🗑️ Delete params:", {
          deviceId,
          unlockType,
          unlockNo: methodId,
          userId,
          userType,
        });

        const response = await fetch(
          `/api/smartlock/unlock-methods/${methodId}?${params.toString()}`,
          { method: "DELETE" }
        );

        const data = await response.json();

        if (data.success) {
          console.log("✅ Method deleted successfully");

          setMethods((prev) =>
            prev.filter((m) => (m.unlock_sn || m.unlock_no) !== methodId)
          );

          setTimeout(() => {
            console.log("🔄 Refreshing methods list...");
            fetchMethods();
          }, 1500);

          onDelete?.(method);
        } else {
          setDeletingIds((prev) => {
            const next = new Set(prev);
            next.delete(methodId);
            return next;
          });
          alert("Failed to delete method: " + data.error);
        }
      } catch (error: any) {
        console.error("❌ Error deleting method:", error);
        const methodId = method.unlock_sn || method.unlock_no;
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(methodId);
          return next;
        });
        alert("Failed to delete method: " + error.message);
      }
    };

    const getMethodIcon = (type: string) => {
      const iconMap: Record<string, any> = {
        password: Key,
        unlock_password: Key,
        fingerprint: Fingerprint,
        unlock_fingerprint: Fingerprint,
        card: CreditCard,
        unlock_card: CreditCard,
        remoteControl: Radio,
        unlock_telecontrol_kit: Radio,
        face: User,
        unlock_face: User,
        hand: Hand,
        unlock_hand: Hand,
        finger_vein: Fingerprint,
        unlock_finger_vein: Fingerprint,
        eye: Eye,
        unlock_eye: Eye,
        key: Lock,
      };
      const Icon = iconMap[type?.toLowerCase()] || Lock;
      return Icon;
    };

    const getMethodTypeName = (type: string) => {
      const nameMap: Record<string, string> = {
        password: "Password",
        unlock_password: "Password",
        fingerprint: "Fingerprint",
        unlock_fingerprint: "Fingerprint",
        card: "Card/Fob",
        unlock_card: "Card/Fob",
        remoteControl: "Remote Control",
        unlock_telecontrol_kit: "Remote Control",
        face: "Face Recognition",
        unlock_face: "Face Recognition",
        hand: "Palm Print",
        unlock_hand: "Palm Print",
        finger_vein: "Finger Vein",
        unlock_finger_vein: "Finger Vein",
        eye: "Iris Recognition",
        unlock_eye: "Iris Recognition",
        key: "Physical Key",
      };
      return (
        nameMap[type?.toLowerCase()] ||
        type?.charAt(0).toUpperCase() + type?.slice(1)
      );
    };

    const getMethodColor = (type: string) => {
      const colorMap: Record<string, string> = {
        password: "bg-blue-50 text-blue-700",
        unlock_password: "bg-blue-50 text-blue-700",
        fingerprint: "bg-green-50 text-green-700",
        unlock_fingerprint: "bg-green-50 text-green-700",
        card: "bg-purple-50 text-purple-700",
        unlock_card: "bg-purple-50 text-purple-700",
        remoteControl: "bg-orange-50 text-orange-700",
        unlock_telecontrol_kit: "bg-orange-50 text-orange-700",
        face: "bg-pink-50 text-pink-700",
        unlock_face: "bg-pink-50 text-pink-700",
        hand: "bg-indigo-50 text-indigo-700",
        unlock_hand: "bg-indigo-50 text-indigo-700",
        finger_vein: "bg-teal-50 text-teal-700",
        unlock_finger_vein: "bg-teal-50 text-teal-700",
        eye: "bg-cyan-50 text-cyan-700",
        unlock_eye: "bg-cyan-50 text-cyan-700",
        key: "bg-neutral-50 text-neutral-700",
      };
      return colorMap[type?.toLowerCase()] || "bg-neutral-50 text-neutral-700";
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

    if (loading && methods.length === 0) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-neutral-200">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    const visibleMethods = methods.filter(
      (m) => !deletingIds.has(m.unlock_sn || m.unlock_no)
    );

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              {userId ? "Assigned Unlock Methods" : "Available Unlock Methods"}
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Last updated: {formatTimeAgo(lastRefreshTime)}
            </p>
          </div>

          <Badge
            variant="outline"
            className="h-8 px-3 font-normal border-neutral-200"
          >
            <Key className="mr-2 h-3 w-3" />
            <span className="text-xs">
              {visibleMethods.length} method
              {visibleMethods.length !== 1 ? "s" : ""}
            </span>
          </Badge>
        </div>

        <Separator className="bg-neutral-200" />

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {visibleMethods.length === 0 && !error ? (
          <Card className="border-neutral-200">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Key className="h-12 w-12 text-neutral-300 mb-3" />
              <p className="text-sm text-neutral-500 font-medium">
                No unlock methods found
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-md">
                {userId
                  ? "This user doesn't have any unlock methods assigned yet. Click 'Assign Method' to add one."
                  : "No unassigned unlock methods available. Enroll new methods directly on the lock device."}
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Methods Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleMethods.map((method, index) => {
              const Icon = getMethodIcon(method.unlock_type || method.dp_code);
              const isDeleting = deletingIds.has(
                method.unlock_sn || method.unlock_no
              );
              const hasDetailedInfo = method.unlock_sn !== undefined;
              const isUnassigned = !userId;

              return (
                <Card
                  key={`${method.unlock_no}-${
                    method.unlock_type || method.dp_code
                  }-${index}`}
                  className={`border-neutral-200 hover:border-neutral-400 transition-all ${
                    isDeleting ? "opacity-50 border-red-300" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-neutral-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            {method.unlock_name ||
                              getMethodTypeName(
                                method.unlock_type || method.dp_code
                              )}
                          </h3>
                          <p className="text-xs text-neutral-500">
                            Slot #{method.unlock_no}
                          </p>
                        </div>
                      </div>

                      {(method.hijack || method.unlock_attr === 1) && (
                        <Badge
                          variant="outline"
                          className="h-5 px-2 text-xs border-red-200 bg-red-50 text-red-700"
                        >
                          <Shield className="mr-1 h-3 w-3" />
                          Duress
                        </Badge>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="text-xs">Type:</span>
                        <Badge
                          variant="secondary"
                          className={`h-5 px-2 text-xs font-normal ${getMethodColor(
                            method.unlock_type || method.dp_code
                          )}`}
                        >
                          {getMethodTypeName(
                            method.unlock_type || method.dp_code
                          )}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <span>Slot Number:</span>
                        <span className="font-mono font-medium">
                          #{method.unlock_no}
                        </span>
                      </div>

                      {hasDetailedInfo && method.unlock_sn && (
                        <div className="flex items-center gap-2 text-xs text-neutral-600">
                          <span>Serial Number:</span>
                          <span className="font-mono font-medium">
                            {method.unlock_sn}
                          </span>
                        </div>
                      )}

                      {/* Show status if available */}
                      {method.delivery_status && (
                        <div className="flex items-center gap-2 text-xs text-neutral-600">
                          <span>Status:</span>
                          <Badge
                            variant="outline"
                            className={`h-5 px-2 text-xs ${
                              method.delivery_status === "SUCCESS"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : method.delivery_status === "FAILED"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            {method.delivery_status}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <Separator className="my-4 bg-neutral-100" />

                    {/* Actions */}
                    <div className="space-y-2">
                      {/* Row 1: Assign OR (Edit + Settings) */}
                      <div className="flex gap-2">
                        {isUnassigned && onAssign ? (
                          <Button
                            onClick={() => onAssign(method)}
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs border-neutral-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                            disabled={isDeleting}
                          >
                            <UserPlus className="mr-2 h-3 w-3" />
                            Assign to User
                          </Button>
                        ) : (
                          <>
                            {hasDetailedInfo && onEdit && (
                              <Button
                                onClick={() => onEdit(method)}
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs border-neutral-200 hover:bg-neutral-50"
                                disabled={isDeleting}
                              >
                                <Edit className="mr-2 h-3 w-3" />
                                Edit
                              </Button>
                            )}

                            {hasDetailedInfo && onSettings && (
                              <Button
                                onClick={() => onSettings(method)}
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs border-neutral-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                disabled={isDeleting}
                              >
                                <Settings className="mr-2 h-3 w-3" />
                                Settings
                              </Button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Row 2: Unbind + Delete (for assigned) OR Info (for unassigned) */}
                      <div className="flex gap-2">
                        {/* Assigned methods - show unbind + delete */}
                        {hasDetailedInfo && userId && (
                          <>
                            {onUnbind && (
                              <Button
                                onClick={() => onUnbind(method)}
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs border-neutral-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                                disabled={isDeleting}
                              >
                                <UserMinus className="mr-2 h-3 w-3" />
                                Unbind
                              </Button>
                            )}

                            <Button
                              onClick={() => handleDelete(method)}
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs border-neutral-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              disabled={isDeleting}
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                          </>
                        )}

                        {/* Unassigned methods - show info message */}
                        {!userId && (
                          <div className="w-full p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-700 text-center">
                              ℹ️ Unassigned methods must be assigned first
                              before deletion
                            </p>
                          </div>
                        )}
                      </div>
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
                About Unlock Methods
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                {userId ? (
                  <>
                    These methods are assigned to this user. You can:
                    <strong> Edit</strong> names, configure{" "}
                    <strong>Settings</strong> (photo capture, duress alarm),{" "}
                    <strong>Unbind</strong> to reassign to others, or{" "}
                    <strong>Delete</strong> to remove permanently from the
                    device.
                  </>
                ) : (
                  <>
                    These methods were enrolled on the lock but not assigned
                    yet.
                    <strong> Assign</strong> them to users to manage them.
                    <strong> Note:</strong> Unassigned methods cannot be deleted
                    via API - assign them first, then delete if needed.
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

UnlockMethodsList.displayName = "UnlockMethodsList";

export default UnlockMethodsList;
