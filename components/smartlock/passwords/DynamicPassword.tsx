// components/smartlock/passwords/DynamicPassword.tsx

"use client";

import { useState } from "react";
import { RefreshCw, Copy, Clock } from "lucide-react";

interface DynamicPasswordProps {
  deviceId: string;
}

export default function DynamicPassword({ deviceId }: DynamicPasswordProps) {
  const [password, setPassword] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const generatePassword = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/smartlock/passwords/dynamic?deviceId=${deviceId}`
      );
      const data = await response.json();

      if (data.success) {
        setPassword(data.data.password);
        setExpiresAt(data.data.invalid_time);
        setTimeRemaining(300); // 5 minutes in seconds

        // Start countdown
        const interval = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error generating dynamic password:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    alert("Password copied to clipboard!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-linear-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Dynamic Password (5 min validity)
      </h3>

      <div className="space-y-4">
        {password ? (
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm border-2 border-purple-300">
                <code className="text-3xl font-bold text-purple-600 tracking-wider">
                  {password}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-5 h-5 text-purple-600" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-purple-700">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-semibold">
                Time remaining: {formatTime(timeRemaining)}
              </span>
            </div>

            {timeRemaining === 0 && (
              <p className="text-red-600 text-sm mt-2">Password has expired</p>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Click the button below to generate a one-time password</p>
          </div>
        )}

        <button
          onClick={generatePassword}
          disabled={loading}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Generating..." : "Generate New Password"}
        </button>
      </div>
    </div>
  );
}
