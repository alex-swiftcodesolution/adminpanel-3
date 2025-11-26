/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/[deviceId]/unlock-methods/page.tsx

"use client";

import { use, useState, useRef } from "react";
import { motion } from "framer-motion";
import UnlockMethodsList, {
  UnlockMethodsListHandle,
} from "@/components/smartlock/unlock-methods/UnlockMethodsList";
import AssignMethodForm from "@/components/smartlock/unlock-methods/AssignMethodForm";
import EditUnlockMethodModal from "@/components/smartlock/unlock-methods/EditUnlockMethodModal";
import MethodSettingsModal from "@/components/smartlock/unlock-methods/MethodSettingsModal";
import { Key, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import UnlockMethodsSummary from "@/components/smartlock/unlock-methods/UnlockMethodsSummary";

interface PageProps {
  params: Promise<{ deviceId: string }>;
}

export default function UnlockMethodsPage({ params }: PageProps) {
  const { deviceId } = use(params);
  const [assigningMethod, setAssigningMethod] = useState<any>(null);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [settingsMethod, setSettingsMethod] = useState<any>(null);
  const listRef = useRef<UnlockMethodsListHandle>(null);

  const handleMethodAssigned = () => {
    setAssigningMethod(null);
    listRef.current?.refresh();
  };

  const handleMethodUpdated = () => {
    setEditingMethod(null);
    listRef.current?.refresh();
  };

  const handleSettingsUpdated = () => {
    setSettingsMethod(null);
    listRef.current?.refresh();
  };

  const handleMethodDeleted = () => {
    setTimeout(() => {
      listRef.current?.refresh();
    }, 2000);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-start gap-3">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="p-3 bg-muted rounded-lg"
          >
            <Key className="w-6 h-6 md:w-7 md:h-7" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Unlock Methods</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage unlock methods and assignments
            </p>
          </div>
        </div>
        <Separator />
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How to Add Unlock Methods</AlertTitle>
          <AlertDescription className="text-xs space-y-1 mt-2">
            <p>
              <strong>1. Enroll on the device:</strong> Register fingerprint,
              card, or password directly on the lock.
            </p>
            <p>
              <strong>2. Method appears here:</strong> It will show as
              &quot;unassigned&quot; in the list below.
            </p>
            <p>
              <strong>3. Assign to user:</strong> Click &quot;Assign&quot; to
              link it to a user account.
            </p>
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <UnlockMethodsSummary deviceId={deviceId} />
      </motion.div>

      {/* Methods List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <UnlockMethodsList
          deviceId={deviceId}
          ref={listRef}
          onAssign={setAssigningMethod}
          onEdit={setEditingMethod}
          onSettings={setSettingsMethod}
          onDelete={handleMethodDeleted}
        />
      </motion.div>

      {/* Modals */}
      {assigningMethod && (
        <AssignMethodForm
          deviceId={deviceId}
          method={assigningMethod}
          onSuccess={handleMethodAssigned}
          onCancel={() => setAssigningMethod(null)}
        />
      )}

      {editingMethod && (
        <EditUnlockMethodModal
          deviceId={deviceId}
          method={editingMethod}
          onSuccess={handleMethodUpdated}
          onCancel={() => setEditingMethod(null)}
        />
      )}

      {settingsMethod && (
        <MethodSettingsModal
          deviceId={deviceId}
          method={settingsMethod}
          onSuccess={handleSettingsUpdated}
          onCancel={() => setSettingsMethod(null)}
        />
      )}
    </div>
  );
}
