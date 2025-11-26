// app/dashboard/[deviceId]/history/page.tsx

"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import UnlockHistoryList from "@/components/smartlock/history/UnlockHistoryList";
import AlarmHistoryList from "@/components/smartlock/history/AlarmHistoryList";
import { History, Unlock, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PageProps {
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

export default function HistoryPage({ params }: PageProps) {
  const { deviceId } = use(params);
  const [activeTab, setActiveTab] = useState<"unlocks" | "alarms">("unlocks");

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
              <History className="w-6 h-6 md:w-7 md:h-7" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">History & Logs</h1>
              <p className="text-sm text-muted-foreground mt-1">
                View unlock events and alarm notifications
              </p>
            </div>
          </div>
        </div>
        <Separator />
      </motion.div>

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item}>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "unlocks" | "alarms")
            }
            className="space-y-6"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="unlocks" className="gap-2">
                <Unlock className="w-4 h-4" />
                Unlock History
              </TabsTrigger>
              <TabsTrigger value="alarms" className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                Alarm History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unlocks" className="mt-6">
              <UnlockHistoryList deviceId={deviceId} />
            </TabsContent>

            <TabsContent value="alarms" className="mt-6">
              <AlarmHistoryList deviceId={deviceId} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
