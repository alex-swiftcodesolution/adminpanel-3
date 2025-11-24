/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/[deviceId]/users/[userId]/unlock-methods/page.tsx

"use client";

import { use, useState, useRef, useEffect } from "react";
import UnlockMethodsList, {
  UnlockMethodsListHandle,
} from "@/components/smartlock/unlock-methods/UnlockMethodsList";
import AssignMethodToUserModal from "@/components/smartlock/unlock-methods/AssignMethodToUserModal";
import EditUnlockMethodModal from "@/components/smartlock/unlock-methods/EditUnlockMethodModal";
import UnbindMethodModal from "@/components/smartlock/unlock-methods/UnbindMethodModal";
import MethodSettingsModal from "@/components/smartlock/unlock-methods/MethodSettingsModal";
import {
  Key,
  ArrowLeft,
  UserCircle,
  Plus,
  Info,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface PageProps {
  params: Promise<{ deviceId: string; userId: string }>;
}

export default function UserUnlockMethodsPage({ params }: PageProps) {
  const { deviceId, userId } = use(params);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>(""); // "Home Member" or "Guest"
  const [userType, setUserType] = useState<number>(2); // Door-lock API type (1 or 2)
  const [methodCount, setMethodCount] = useState<number>(0);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [unbindingMethod, setUnbindingMethod] = useState<any>(null);
  const [settingsMethod, setSettingsMethod] = useState<any>(null);
  const listRef = useRef<UnlockMethodsListHandle>(null);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `/api/smartlock/users/${userId}?deviceId=${deviceId}`
        );
        const data = await response.json();
        if (data.success && data.data) {
          setUserName(data.data.nick_name || "Unknown User");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [deviceId, userId]);

  // Detect user type from methods
  useEffect(() => {
    const detectUserType = async () => {
      try {
        const response = await fetch(
          `/api/smartlock/unlock-methods?deviceId=${deviceId}&userId=${userId}&userType=1`
        );
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          const firstMethod = data.data[0];
          setMethodCount(data.data.length);

          // Map smart-lock user_type to door-lock user_type and user-friendly role
          if (firstMethod.user_type !== undefined) {
            const smartLockType = firstMethod.user_type;

            // Smart lock types: 10=admin, 20=family, 30=normal, 40=shared, 50=owner
            // Door lock types: 1=home member, 2=non-home member

            let doorLockType = 2;
            let roleName = "Guest";

            if ([10, 20, 50].includes(smartLockType)) {
              doorLockType = 1;
              roleName = "Home Member";
            } else if ([30, 40].includes(smartLockType)) {
              doorLockType = 2;
              roleName = "Guest";
            }

            setUserType(doorLockType);
            setUserRole(roleName);

            console.log("✅ User role detected:", {
              smartLockType,
              doorLockType,
              roleName,
            });
          }
        } else {
          setMethodCount(0);
        }
      } catch (error) {
        console.error("Error detecting user type:", error);
      }
    };

    detectUserType();
  }, [deviceId, userId]);

  const handleSuccess = () => {
    setShowAssignModal(false);
    setEditingMethod(null);
    setUnbindingMethod(null);
    setSettingsMethod(null);
    listRef.current?.refresh();
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link href={`/dashboard/${deviceId}/users`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-100 rounded-lg">
              <Key className="w-8 h-8 text-neutral-900" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                  Unlock Methods
                </h1>
                <Badge
                  variant="outline"
                  className="border-neutral-200 text-neutral-600"
                >
                  <UserCircle className="mr-1 h-3 w-3" />
                  {userName}
                </Badge>
                {userRole && (
                  <Badge
                    variant="outline"
                    className={
                      userRole === "Home Member"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-purple-200 bg-purple-50 text-purple-700"
                    }
                  >
                    <Users className="mr-1 h-3 w-3" />
                    {userRole}
                  </Badge>
                )}
                {methodCount > 0 && (
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    <Key className="mr-1 h-3 w-3" />
                    {methodCount} {methodCount === 1 ? "Method" : "Methods"}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Manage unlock methods for this user
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowAssignModal(true)}
            className="bg-neutral-900 hover:bg-neutral-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Assign Method
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* What you can do */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg shrink-0">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Available Actions
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Assign unlock methods from available pool</li>
                <li>• Edit method names for easy identification</li>
                <li>
                  • Configure security settings (duress alarm, photo capture)
                </li>
                <li>• Unbind methods to reassign to other users</li>
                <li>• Remove methods permanently from the device</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Security notice */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg shrink-0">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 mb-2">
                Security Note
              </p>
              <p className="text-xs text-amber-700">
                Changes to unlock methods are synced to the device in real-time.
                Ensure the lock is online for immediate updates. Removed methods
                cannot be recovered and must be re-enrolled on the device.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Methods List */}
      <UnlockMethodsList
        deviceId={deviceId}
        userId={userId}
        userType={userType}
        ref={listRef}
        onEdit={setEditingMethod}
        onUnbind={setUnbindingMethod}
        onSettings={setSettingsMethod}
      />

      {/* Modals */}
      {showAssignModal && (
        <AssignMethodToUserModal
          deviceId={deviceId}
          userId={userId}
          userName={userName}
          onSuccess={handleSuccess}
          onCancel={() => setShowAssignModal(false)}
        />
      )}

      {editingMethod && (
        <EditUnlockMethodModal
          deviceId={deviceId}
          method={editingMethod}
          onSuccess={handleSuccess}
          onCancel={() => setEditingMethod(null)}
        />
      )}

      {unbindingMethod && (
        <UnbindMethodModal
          deviceId={deviceId}
          userId={userId}
          userName={userName}
          method={unbindingMethod}
          onSuccess={handleSuccess}
          onCancel={() => setUnbindingMethod(null)}
        />
      )}

      {settingsMethod && (
        <MethodSettingsModal
          deviceId={deviceId}
          method={settingsMethod}
          onSuccess={handleSuccess}
          onCancel={() => setSettingsMethod(null)}
        />
      )}
    </div>
  );
}
