/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/[deviceId]/unlock-methods/remote-settings/page.tsx

"use client";

import { use, useState, useEffect } from "react";
import { Radio, ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface PageProps {
  params: Promise<{ deviceId: string }>;
}

export default function RemoteUnlockSettingsPage({ params }: PageProps) {
  const { deviceId } = use(params);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, [deviceId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/smartlock/unlock-methods/remote-settings?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.success) {
        setSettings(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError("Failed to load remote unlock settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (type: string, currentState: boolean) => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "/api/smartlock/unlock-methods/remote-settings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            remoteUnlockType: type,
            open: !currentState,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        await fetchSettings();
      } else {
        setError(data.error || "Failed to update setting");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const getSettingName = (type: string) => {
    if (type === "remoteUnlockWithoutPwd") return "Remote Unlock (No Password)";
    if (type === "remoteUnlockWithPwd") return "Remote Unlock (With Password)";
    return type;
  };

  const getSettingDescription = (type: string) => {
    if (type === "remoteUnlockWithoutPwd")
      return "Unlock the door remotely without requiring a password";
    if (type === "remoteUnlockWithPwd")
      return "Unlock the door remotely after entering a password";
    return "";
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link href={`/dashboard/${deviceId}/unlock-methods`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Unlock Methods
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-neutral-100 rounded-lg">
            <Radio className="w-8 h-8 text-neutral-900" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Remote Unlock Settings
            </h1>
            <p className="text-sm text-neutral-500">
              Configure remote unlock methods
            </p>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Available Remote Methods
          </CardTitle>
        </CardHeader>
        <Separator className="bg-neutral-200" />
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-neutral-500">
              Loading settings...
            </div>
          ) : settings.length === 0 ? (
            <div className="py-8 text-center text-neutral-500">
              No remote unlock methods available for this device
            </div>
          ) : (
            <div className="space-y-4">
              {settings.map((setting, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-900">
                      {getSettingName(setting.remote_unlock_type)}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {getSettingDescription(setting.remote_unlock_type)}
                    </p>
                  </div>

                  <Button
                    onClick={() =>
                      handleToggle(setting.remote_unlock_type, setting.open)
                    }
                    disabled={saving}
                    size="sm"
                    variant={setting.open ? "default" : "outline"}
                    className={
                      setting.open
                        ? "bg-green-600 hover:bg-green-700"
                        : "border-neutral-300"
                    }
                  >
                    {setting.open ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Disabled
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
