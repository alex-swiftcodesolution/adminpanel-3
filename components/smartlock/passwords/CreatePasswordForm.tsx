/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/passwords/CreatePasswordForm.tsx

"use client";

import { useState } from "react";
import { Calendar, Save } from "lucide-react";

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
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Create Temporary Password
      </h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Guest Access, Delivery"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password (6 digits)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1234567"
              pattern="[0-9]{7}"
              maxLength={7}
              required
            />
            <button
              type="button"
              onClick={generateRandomPassword}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Generate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Valid From
            </label>
            <input
              type="datetime-local"
              value={formData.effectiveTime}
              onChange={(e) =>
                setFormData({ ...formData, effectiveTime: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Valid Until
            </label>
            <input
              type="datetime-local"
              value={formData.invalidTime}
              onChange={(e) =>
                setFormData({ ...formData, invalidTime: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPeriodic"
            checked={formData.isPeriodic}
            onChange={(e) =>
              setFormData({ ...formData, isPeriodic: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="isPeriodic"
            className="text-sm font-medium text-gray-700"
          >
            Periodic Password (Recurring)
          </label>
        </div>

        {formData.isPeriodic && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phase (Days between recurrence)
            </label>
            <input
              type="number"
              value={formData.phase}
              onChange={(e) =>
                setFormData({ ...formData, phase: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="7"
              min="1"
              required={formData.isPeriodic}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {loading ? "Creating..." : "Create Password"}
        </button>
      </div>
    </form>
  );
}
