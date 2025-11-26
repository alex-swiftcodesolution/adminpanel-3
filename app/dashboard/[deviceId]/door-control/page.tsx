// app/dashboard/[deviceId]/door-control/page.tsx

"use client";

import { motion } from "framer-motion";
import DoorControlPanel from "@/components/smartlock/door-control/DoorControlPanel";
import { DoorOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { use } from "react";

interface PageProps {
  params: Promise<{ deviceId: string }>;
}

export default function DoorControlPage({ params }: PageProps) {
  const { deviceId } = use(params);

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
            <DoorOpen className="w-6 h-6 md:w-7 md:h-7" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Door Control</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Remote lock and unlock operations
            </p>
          </div>
        </div>
        <Separator />
      </motion.div>

      {/* Control Panel */}
      <DoorControlPanel deviceId={deviceId} />
    </div>
  );
}
