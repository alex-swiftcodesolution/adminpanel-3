/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/[deviceId]/users/[userId]/unlock-methods/page.tsx

"use client";

import { use, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface PageProps {
  params: Promise<{ deviceId: string; userId: string }>;
}

export default function UserUnlockMethodsPage({ params }: PageProps) {
  const { deviceId, userId } = use(params);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [userType, setUserType] = useState<number>(2);
  const [methodCount, setMethodCount] = useState<number>(0);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [unbindingMethod, setUnbindingMethod] = useState<any>(null);
  const [settingsMethod, setSettingsMethod] = useState<any>(null);
  const listRef = useRef<UnlockMethodsListHandle>(null);

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

          if (firstMethod.user_type !== undefined) {
            const smartLockType = firstMethod.user_type;
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
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Link href={`/dashboard/${deviceId}/users`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="p-3 bg-muted rounded-lg"
            >
              <Key className="w-6 h-6 md:w-7 md:h-7" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Unlock Methods
                </h1>
                <Badge variant="outline">
                  <UserCircle className="mr-1 h-3 w-3" />
                  {userName}
                </Badge>
                {userRole && (
                  <Badge variant="secondary">
                    <Users className="mr-1 h-3 w-3" />
                    {userRole}
                  </Badge>
                )}
                {methodCount > 0 && (
                  <Badge>
                    <Key className="mr-1 h-3 w-3" />
                    {methodCount} {methodCount === 1 ? "Method" : "Methods"}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Manage unlock methods for this user
              </p>
            </div>
          </div>

          <Button onClick={() => setShowAssignModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Assign Method
          </Button>
        </div>
        <Separator />
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-4"
      >
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong className="block mb-2">Available Actions</strong>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Assign unlock methods from available pool</li>
              <li>Edit method names for easy identification</li>
              <li>Configure security settings (duress alarm, photo capture)</li>
              <li>Unbind methods to reassign to other users</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong className="block mb-2">Security Note</strong>
            <p className="text-xs">
              Changes to unlock methods are synced to the device in real-time.
              Ensure the lock is online for immediate updates.
            </p>
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Methods List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <UnlockMethodsList
          deviceId={deviceId}
          userId={userId}
          userType={userType}
          ref={listRef}
          onEdit={setEditingMethod}
          onUnbind={setUnbindingMethod}
          onSettings={setSettingsMethod}
        />
      </motion.div>

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
