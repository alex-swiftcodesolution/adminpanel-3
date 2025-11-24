// components/smartlock/unlock-methods/QuickActions.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Key, UserPlus, Radio, Settings } from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  deviceId: string;
}

export default function QuickActions({ deviceId }: QuickActionsProps) {
  const actions = [
    {
      title: "View All Methods",
      description: "See all unlock methods",
      icon: Key,
      href: `/dashboard/${deviceId}/unlock-methods`,
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    },
    {
      title: "Manage Users",
      description: "View user assignments",
      icon: UserPlus,
      href: `/dashboard/${deviceId}/users`,
      color: "bg-green-50 text-green-600 hover:bg-green-100",
    },
    {
      title: "Remote Settings",
      description: "Configure remote unlock",
      icon: Radio,
      href: `/dashboard/${deviceId}/unlock-methods/remote-settings`,
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <Link key={index} href={action.href}>
          <Card className="border-neutral-200 hover:border-neutral-400 transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${action.color} transition-colors`}
                >
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">
                    {action.title}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {action.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
