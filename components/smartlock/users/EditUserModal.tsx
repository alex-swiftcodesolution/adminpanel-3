/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/users/EditUserModal.tsx

"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeviceUser {
  user_id: string;
  device_id: string;
  nick_name: string;
  sex: 0 | 1 | 2;
  contact: string;
  birthday?: number;
  height: number;
  weight: number;
}

interface EditUserModalProps {
  deviceId: string;
  user: DeviceUser;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditUserModal({
  deviceId,
  user,
  onSuccess,
  onCancel,
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    nickName: user.nick_name,
    sex: user.sex === 0 ? "1" : user.sex.toString(),
    contact: user.contact || "",
    birthday: user.birthday
      ? new Date(user.birthday).toISOString().split("T")[0]
      : "",
    height: user.height > 0 ? user.height.toString() : "",
    weight: user.weight > 0 ? (user.weight / 1000).toString() : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const requestData: any = {
        deviceId,
        nick_name: formData.nickName,
        sex: parseInt(formData.sex),
      };

      if (formData.contact) requestData.contact = formData.contact;
      if (formData.birthday) {
        requestData.birthday = new Date(formData.birthday).getTime();
      }
      if (formData.height) requestData.height = parseInt(formData.height);
      if (formData.weight) {
        requestData.weight = Math.round(parseFloat(formData.weight) * 1000);
      }

      const response = await fetch(`/api/smartlock/users/${user.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.();
      } else {
        setError(data.error || "Failed to update user");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel?.()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information for {user.nick_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nickName">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nickName"
              value={formData.nickName}
              onChange={(e) =>
                setFormData({ ...formData, nickName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">
              Gender <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.sex}
              onValueChange={(value) =>
                setFormData({ ...formData, sex: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Male</SelectItem>
                <SelectItem value="2">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
              placeholder="Phone or email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) =>
                setFormData({ ...formData, birthday: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: e.target.value })
                }
                min="0"
                max="300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                min="0"
                max="500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
