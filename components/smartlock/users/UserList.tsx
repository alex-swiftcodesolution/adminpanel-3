// components/smartlock/users/UserList.tsx

"use client";

import { useState, useEffect } from "react";
import { DeviceUser } from "@/lib/tuya/tuya-api-wrapper";
import { Edit, Trash2, User, Shield, Clock } from "lucide-react";

interface UserListProps {
  deviceId: string;
  onEdit?: (user: DeviceUser) => void;
}

export default function UserList({ deviceId, onEdit }: UserListProps) {
  const [users, setUsers] = useState<DeviceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "device" | "home">("all");

  useEffect(() => {
    fetchUsers();
  }, [deviceId, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const type = filter === "home" ? "home" : "device";
      const response = await fetch(
        `/api/smartlock/users?deviceId=${deviceId}&type=${type}`
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(
        `/api/smartlock/users/${userId}?deviceId=${deviceId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (data.success) {
        setUsers(users.filter((u) => u.user_id !== userId));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const getUserTypeLabel = (type: number) => {
    const types: Record<number, string> = {
      0: "Admin",
      1: "Member",
      2: "Guest",
      3: "Temporary",
    };
    return types[type] || "Unknown";
  };

  const getRoleLabel = (role?: number) => {
    if (role === undefined) return "";
    const roles: Record<number, string> = {
      0: "Owner",
      1: "Manager",
      2: "Regular User",
    };
    return roles[role] || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>

        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="device">Device Users</option>
            <option value="home">Home Users</option>
          </select>
          <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
            {users.length} users
          </span>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div
              key={user.user_id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.user_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user.user_name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      ID: {user.user_id}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit?.(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit user"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.user_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Type: {getUserTypeLabel(user.user_type)}</span>
                </div>

                {user.role !== undefined && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Role: {getRoleLabel(user.role)}</span>
                  </div>
                )}

                {user.unlock_methods && user.unlock_methods.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">
                      Unlock Methods:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {user.unlock_methods.map((method, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                        >
                          {method.unlock_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
