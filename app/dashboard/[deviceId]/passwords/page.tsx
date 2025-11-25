// app/dashboard/[deviceId]/passwords/page.tsx

"use client";

import { use, useState, useRef } from "react";
import { motion } from "framer-motion";
import PasswordList, {
  PasswordListHandle,
} from "@/components/smartlock/passwords/PasswordList";
import CreatePasswordForm from "@/components/smartlock/passwords/CreatePasswordForm";
import { Key, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PasswordsPageProps {
  params: Promise<{ deviceId: string }>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function PasswordsPage({ params }: PasswordsPageProps) {
  const { deviceId } = use(params);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const passwordListRef = useRef<PasswordListHandle>(null);

  const handlePasswordCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteAllIndividually = async () => {
    setShowDeleteDialog(false);
    const passwordIds = passwordListRef.current?.getAllPasswordIds() || [];

    if (passwordIds.length === 0) {
      return;
    }

    setIsDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < passwordIds.length; i++) {
      const id = passwordIds[i];
      try {
        const response = await fetch(
          `/api/smartlock/passwords/temporary/${id}?deviceId=${deviceId}`,
          { method: "DELETE" }
        );

        const data = await response.json();

        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }

        if (i < passwordIds.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      } catch (error) {
        failCount++;
      }
    }

    setIsDeleting(false);
    passwordListRef.current?.refresh();
  };

  const handleClearAll = async () => {
    setShowClearDialog(false);

    try {
      const response = await fetch("/api/smartlock/passwords/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();

      if (data.success) {
        setTimeout(() => {
          passwordListRef.current?.refresh();
        }, 3000);
      }
    } catch (error) {
      console.error("Error clearing passwords:", error);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
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
              <h1 className="text-2xl md:text-3xl font-bold">
                Password Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage temporary access codes
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete All"}
            </Button>

            <Button
              onClick={() => setShowClearDialog(true)}
              disabled={isDeleting}
              variant="outline"
              size="sm"
              className="h-9 opacity-60"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Clear All (API)
            </Button>
          </div>
        </div>
        <Separator />
      </motion.div>

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid lg:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="lg:col-span-1">
          <CreatePasswordForm
            deviceId={deviceId}
            onSuccess={handlePasswordCreated}
          />
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2">
          <PasswordList
            key={refreshKey}
            deviceId={deviceId}
            ref={passwordListRef}
          />
        </motion.div>
      </motion.div>

      {/* Delete All Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Passwords?</DialogTitle>
            <DialogDescription>
              This will delete all active passwords one by one. This action
              cannot be undone and may take some time to complete.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteAllIndividually}>Delete All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Use Clear All API?</DialogTitle>
            <DialogDescription>
              This will attempt to use Tuya&apos;s Clear All API. Note: This API
              may not work for all device types. If it fails, use &quot;Delete
              All&quot; instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearAll}>Try Clear All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
