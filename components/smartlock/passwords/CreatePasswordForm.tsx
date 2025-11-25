/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/passwords/CreatePasswordForm.tsx

"use client";

import { useState } from "react";
import { Calendar, Save, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreatePasswordFormProps {
  deviceId: string;
  onSuccess?: () => void;
}

export default function CreatePasswordForm({
  deviceId,
  onSuccess,
}: CreatePasswordFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    effectiveTime: "",
    invalidTime: "",
    isPeriodic: false,
    phase: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/smartlock/passwords/temporary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          name: formData.name,
          password: formData.password,
          effectiveTime: new Date(formData.effectiveTime).getTime() / 1000,
          invalidTime: new Date(formData.invalidTime).getTime() / 1000,
          phase: formData.isPeriodic ? parseInt(formData.phase) : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          name: "",
          password: "",
          effectiveTime: "",
          invalidTime: "",
          isPeriodic: false,
          phase: "",
        });
        onSuccess?.();
      } else {
        setError(data.error || "Failed to create password");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const password = Math.floor(1000000 + Math.random() * 9000000).toString();
    setFormData({ ...formData, password });
  };

  return (
    <Card className="h-fit sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Create Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Password Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Guest Access, Delivery"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password (7 digits)</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="1234567"
                pattern="[0-9]{7}"
                maxLength={7}
                required
                className="flex-1"
              />
              <Button
                type="button"
                onClick={generateRandomPassword}
                variant="outline"
                size="icon"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveTime">Valid From</Label>
              <Input
                id="effectiveTime"
                type="datetime-local"
                value={formData.effectiveTime}
                onChange={(e) =>
                  setFormData({ ...formData, effectiveTime: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invalidTime">Valid Until</Label>
              <Input
                id="invalidTime"
                type="datetime-local"
                value={formData.invalidTime}
                onChange={(e) =>
                  setFormData({ ...formData, invalidTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPeriodic"
              checked={formData.isPeriodic}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPeriodic: checked as boolean })
              }
            />
            <Label
              htmlFor="isPeriodic"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Periodic Password (Recurring)
            </Label>
          </div>

          {formData.isPeriodic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="phase">Phase (Days between recurrence)</Label>
              <Input
                id="phase"
                type="number"
                value={formData.phase}
                onChange={(e) =>
                  setFormData({ ...formData, phase: e.target.value })
                }
                placeholder="7"
                min="1"
                required={formData.isPeriodic}
              />
            </motion.div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Creating..." : "Create Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
