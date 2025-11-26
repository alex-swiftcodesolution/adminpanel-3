// components/smartlock/unlock-methods/UnlockMethodsSummary.tsx

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Users, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface UnlockMethodsSummaryProps {
  deviceId: string;
}

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};

export default function UnlockMethodsSummary({
  deviceId,
}: UnlockMethodsSummaryProps) {
  const [stats, setStats] = useState({
    total: 0,
    unassigned: 0,
    assigned: 0,
    duress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const unassignedRes = await fetch(
          `/api/smartlock/unlock-methods?deviceId=${deviceId}`
        );
        const unassignedData = await unassignedRes.json();

        const unassigned = unassignedData.success
          ? unassignedData.data.length
          : 0;

        setStats({
          total: unassigned,
          unassigned,
          assigned: 0,
          duress: 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [deviceId]);

  const statCards = [
    {
      label: "Unassigned Methods",
      value: stats.unassigned,
      icon: Key,
    },
    {
      label: "Total Methods",
      value: stats.total,
      icon: Users,
    },
    {
      label: "Duress Alarms",
      value: stats.duress,
      icon: Shield,
    },
  ];

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <motion.div key={stat.label} variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
