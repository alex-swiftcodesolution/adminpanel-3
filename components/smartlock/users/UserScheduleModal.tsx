/* eslint-disable @typescript-eslint/no-explicit-any */
// components/smartlock/users/UserScheduleModal.tsx

"use client";

import { useState } from "react";
import { Calendar, Clock, X, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface DeviceUser {
  user_id: string;
  nick_name: string;
}

interface ScheduleDetail {
  start_minute: number;
  end_minute: number;
  working_day: number;
  time_zone_id: string;
  all_day: boolean;
}

interface UserScheduleModalProps {
  deviceId: string;
  user: DeviceUser;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DAYS = [
  { label: "Sun", value: 1 },
  { label: "Mon", value: 2 },
  { label: "Tue", value: 4 },
  { label: "Wed", value: 8 },
  { label: "Thu", value: 16 },
  { label: "Fri", value: 32 },
  { label: "Sat", value: 64 },
];

export default function UserScheduleModal({
  deviceId,
  user,
  onSuccess,
  onCancel,
}: UserScheduleModalProps) {
  const [permanent, setPermanent] = useState(true);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expiredDate, setExpiredDate] = useState("");
  const [schedules, setSchedules] = useState<ScheduleDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        start_minute: 0, // 00:00
        end_minute: 1439, // 23:59
        working_day: 127, // All days
        time_zone_id: "Asia/Karachi",
        all_day: true,
      },
    ]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, updates: Partial<ScheduleDetail>) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], ...updates };
    setSchedules(updated);
  };

  const toggleDay = (index: number, dayValue: number) => {
    const schedule = schedules[index];
    const newWorkingDay =
      schedule.working_day & dayValue
        ? schedule.working_day - dayValue // Remove day
        : schedule.working_day + dayValue; // Add day

    updateSchedule(index, { working_day: newWorkingDay });
  };

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  const timeToMinutes = (time: string) => {
    const [hours, mins] = time.split(":").map(Number);
    return hours * 60 + mins;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const requestData: any = {
        deviceId,
        permanent,
      };

      if (!permanent) {
        if (!effectiveDate || !expiredDate) {
          setError("Please select both start and end dates");
          setLoading(false);
          return;
        }

        requestData.effectiveTime = Math.floor(
          new Date(effectiveDate).getTime() / 1000
        );
        requestData.expiredTime = Math.floor(
          new Date(expiredDate).getTime() / 1000
        );
      }

      if (schedules.length > 0) {
        requestData.scheduleDetails = schedules;
      }

      console.log("📅 Submitting schedule:", requestData);

      const response = await fetch(
        `/api/smartlock/users/${user.user_id}/schedule`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log("✅ Schedule updated successfully");
        onSuccess?.();
      } else {
        setError(data.error || "Failed to update schedule");
      }
    } catch (error: any) {
      console.error("❌ Error updating schedule:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
        <CardHeader className="pb-3 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">
                User Schedule
              </CardTitle>
              <p className="text-xs text-neutral-500 mt-1">
                Set access schedule for {user.nick_name}
              </p>
            </div>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Permanent Access Toggle */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div>
                <label className="text-sm font-medium text-neutral-900">
                  Permanent Access
                </label>
                <p className="text-xs text-neutral-500 mt-0.5">
                  User can access anytime without time restrictions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={permanent}
                  onChange={(e) => setPermanent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
              </label>
            </div>

            {/* Time Range (if not permanent) */}
            {!permanent && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                  <Calendar className="h-4 w-4" />
                  Validity Period
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      required={!permanent}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={expiredDate}
                      onChange={(e) => setExpiredDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      required={!permanent}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Recurring Schedules */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                  <Clock className="h-4 w-4" />
                  Recurring Time Schedules
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                </div>
                <Button
                  type="button"
                  onClick={addSchedule}
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Add Schedule
                </Button>
              </div>

              {schedules.length === 0 ? (
                <div className="text-center py-8 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                  <Clock className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">
                    No recurring schedules. User can access 24/7 during validity
                    period.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule, index) => (
                    <Card key={index} className="border-neutral-200">
                      <CardContent className="p-4 space-y-4">
                        {/* Delete Button */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-neutral-700">
                            Schedule {index + 1}
                          </span>
                          <Button
                            type="button"
                            onClick={() => removeSchedule(index)}
                            variant="ghost"
                            size="sm"
                            className="h-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* All Day Toggle */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`all-day-${index}`}
                            checked={schedule.all_day}
                            onChange={(e) =>
                              updateSchedule(index, {
                                all_day: e.target.checked,
                                start_minute: e.target.checked
                                  ? 0
                                  : schedule.start_minute,
                                end_minute: e.target.checked
                                  ? 1439
                                  : schedule.end_minute,
                              })
                            }
                            className="rounded border-neutral-300"
                          />
                          <label
                            htmlFor={`all-day-${index}`}
                            className="text-xs text-neutral-600"
                          >
                            All Day (24 hours)
                          </label>
                        </div>

                        {/* Time Range (if not all day) */}
                        {!schedule.all_day && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-neutral-700 mb-1">
                                Start Time
                              </label>
                              <input
                                type="time"
                                value={minutesToTime(schedule.start_minute)}
                                onChange={(e) =>
                                  updateSchedule(index, {
                                    start_minute: timeToMinutes(e.target.value),
                                  })
                                }
                                className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-neutral-700 mb-1">
                                End Time
                              </label>
                              <input
                                type="time"
                                value={minutesToTime(schedule.end_minute)}
                                onChange={(e) =>
                                  updateSchedule(index, {
                                    end_minute: timeToMinutes(e.target.value),
                                  })
                                }
                                className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded-lg"
                              />
                            </div>
                          </div>
                        )}

                        {/* Days of Week */}
                        <div>
                          <label className="block text-xs font-medium text-neutral-700 mb-2">
                            Active Days
                          </label>
                          <div className="flex gap-2 flex-wrap">
                            {DAYS.map((day) => (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => toggleDay(index, day.value)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                  schedule.working_day & day.value
                                    ? "bg-neutral-900 text-white"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                              >
                                {day.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Info Banner */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                ℹ️ <strong>How it works:</strong> If permanent is enabled, user
                has 24/7 access. If disabled, access is limited to the date
                range. Recurring schedules further restrict access to specific
                days and times.
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
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Schedule"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
