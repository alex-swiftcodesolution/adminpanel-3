/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/[deviceId]/unlock-methods/page.tsx

"use client";

import { use, useState, useRef } from "react";
import UnlockMethodsList, {
  UnlockMethodsListHandle,
} from "@/components/smartlock/unlock-methods/UnlockMethodsList";
import AssignMethodForm from "@/components/smartlock/unlock-methods/AssignMethodForm";
import EditUnlockMethodModal from "@/components/smartlock/unlock-methods/EditUnlockMethodModal";
import MethodSettingsModal from "@/components/smartlock/unlock-methods/MethodSettingsModal";
import { Key, Info, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
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
    <div className="min-h-screen bg-neutral-50/50 p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-neutral-100 rounded-lg">
            <Key className="w-8 h-8 text-neutral-900" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Unlock Methods
            </h1>
            <p className="text-sm text-neutral-500">
              Manage unlock methods and assignments
            </p>
          </div>
        </div>

        {/* <Link href={`/dashboard/${deviceId}/unlock-methods/remote-settings`}>
          <Button variant="outline" className="gap-2">
            <Radio className="h-4 w-4" />
            Remote Settings
          </Button>
        </Link> */}
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              How to Add Unlock Methods
            </p>
            <p className="text-xs text-blue-700 mt-1">
              1. <strong>Enroll on the device:</strong> Register fingerprint,
              card, or password directly on the lock.
              <br />
              2. <strong>Method appears here:</strong> It will show as
              &quot;unassigned&quot; in the list below.
              <br />
              3. <strong>Assign to user:</strong> Click &quot;Assign&quot; to
              link it to a user account.
            </p>
          </div>
        </CardContent>
      </Card>

      <UnlockMethodsSummary deviceId={deviceId} />

      {/* Methods List */}
      <UnlockMethodsList
        deviceId={deviceId}
        ref={listRef}
        onAssign={setAssigningMethod}
        onEdit={setEditingMethod}
        onSettings={setSettingsMethod}
        onDelete={handleMethodDeleted}
      />

      {/* Assign Method Modal */}
      {assigningMethod && (
        <AssignMethodForm
          deviceId={deviceId}
          method={assigningMethod}
          onSuccess={handleMethodAssigned}
          onCancel={() => setAssigningMethod(null)}
        />
      )}

      {/* Edit Method Modal */}
      {editingMethod && (
        <EditUnlockMethodModal
          deviceId={deviceId}
          method={editingMethod}
          onSuccess={handleMethodUpdated}
          onCancel={() => setEditingMethod(null)}
        />
      )}

      {/* Settings Modal */}
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
