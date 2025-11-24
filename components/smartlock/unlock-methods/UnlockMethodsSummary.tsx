// components/smartlock/unlock-methods/UnlockMethodsSummary.tsx

"use client";

import { useState, useEffect } from "react";
import { Key, Users, Shield, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UnlockMethodsSummaryProps {
  deviceId: string;
}

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

        // Fetch unassigned methods
        const unassignedRes = await fetch(
          `/api/smartlock/unlock-methods?deviceId=${deviceId}`
        );
        const unassignedData = await unassignedRes.json();

        const unassigned = unassignedData.success
          ? unassignedData.data.length
          : 0;

        // For now, we can't get total assigned across all users easily
        // So we'll just show unassigned
        setStats({
          total: unassigned, // This would need to be calculated differently for accurate total
          unassigned,
          assigned: 0, // Would need to query all users
          duress: 0, // Would need to check each method
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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Total Methods",
      value: stats.total,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Duress Alarms",
      value: stats.duress,
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-neutral-200 animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-neutral-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
