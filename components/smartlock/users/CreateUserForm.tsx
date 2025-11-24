/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/users/CreateUserForm.tsx

"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CreateUserFormProps {
  deviceId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateUserForm({
  deviceId,
  onSuccess,
  onCancel,
}: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    nickName: "",
    sex: 1 as 1 | 2,
    contact: "",
    birthday: "",
    height: "",
    weight: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ Build request data with correct field names
      const requestData: any = {
        deviceId,
        nickName: formData.nickName,
        sex: formData.sex,
      };

      // Add optional fields if provided
      if (formData.contact) requestData.contact = formData.contact;
      if (formData.birthday) {
        requestData.birthday = new Date(formData.birthday).getTime();
      }
      if (formData.height) requestData.height = parseInt(formData.height);
      if (formData.weight) {
        // Convert kg to grams
        requestData.weight = Math.round(parseFloat(formData.weight) * 1000);
      }

      console.log("📤 Creating user:", requestData);

      const response = await fetch("/api/smartlock/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ User created:", data.data);
        setFormData({
          nickName: "",
          sex: 1,
          contact: "",
          birthday: "",
          height: "",
          weight: "",
        });
        onSuccess?.();
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch (error: any) {
      console.error("❌ Error creating user:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Create New User
            </CardTitle>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <Separator className="bg-neutral-200" />

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Name - Required */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nickName}
                onChange={(e) =>
                  setFormData({ ...formData, nickName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Gender - Required */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sex}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sex: parseInt(e.target.value) as 1 | 2,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                required
              >
                <option value={1}>Male</option>
                <option value={2}>Female</option>
              </select>
            </div>

            {/* Contact - Optional */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Contact
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="Phone or email"
              />
            </div>

            {/* Birthday - Optional */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Birthday
              </label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) =>
                  setFormData({ ...formData, birthday: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="170"
                  min="0"
                  max="300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="70"
                  min="0"
                  max="500"
                />
              </div>
            </div>

            {/* Info Banner */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                ℹ️ After creating this user, they&apos;ll need to enroll their
                unlock methods (fingerprint, card, password) directly on the
                lock device.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-neutral-900 hover:bg-neutral-800"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {loading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
