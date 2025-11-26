/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/users/CreateUserForm.tsx

"use client";

import { useState } from "react";
import { Info, UserPlus } from "lucide-react";
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
    sex: "1",
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
      const requestData: any = {
        deviceId,
        nickName: formData.nickName,
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

      const response = await fetch("/api/smartlock/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          nickName: "",
          sex: "1",
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel?.()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the device. They&apos;ll need to enroll their
            unlock methods on the lock.
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
              placeholder="John Doe"
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
                placeholder="170"
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
                placeholder="70"
                min="0"
                max="500"
              />
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              After creating this user, they&apos;ll need to enroll their unlock
              methods (fingerprint, card, password) directly on the lock device.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
