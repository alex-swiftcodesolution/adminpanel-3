// app/dashboard/[deviceId]/users/page.tsx

"use client";

import { use, useState } from "react";
import UserList from "@/components/smartlock/users/UserList";
import CreateUserForm from "@/components/smartlock/users/CreateUserForm";
import EditUserModal from "@/components/smartlock/users/EditUserModal";
import { DeviceUser } from "@/lib/tuya/tuya-api-wrapper";
import { Users, UserPlus } from "lucide-react";

interface UsersPageProps {
  params: Promise<{ deviceId: string }>;
}

export default function UsersPage({ params }: UsersPageProps) {
  const { deviceId } = use(params);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<DeviceUser | null>(null);

  const handleUserCreated = () => {
    setShowCreateForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleUserUpdated = () => {
    setEditingUser(null);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="text-gray-500">Device ID: {deviceId}</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add New User
          </button>
        </div>

        {/* User List */}
        <UserList
          key={refreshKey}
          deviceId={deviceId}
          onEdit={setEditingUser}
        />

        {/* Create User Modal */}
        {showCreateForm && (
          <CreateUserForm
            deviceId={deviceId}
            onSuccess={handleUserCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <EditUserModal
            deviceId={deviceId}
            user={editingUser}
            onSuccess={handleUserUpdated}
            onCancel={() => setEditingUser(null)}
          />
        )}
      </div>
    </div>
  );
}
