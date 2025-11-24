// app/dashboard/[deviceId]/users/page.tsx

"use client";

import { use, useState, useRef } from "react";
import UserList, {
  UserListHandle,
} from "@/components/smartlock/users/UserList";
import CreateUserForm from "@/components/smartlock/users/CreateUserForm";
import EditUserModal from "@/components/smartlock/users/EditUserModal";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface UsersPageProps {
  params: Promise<{ deviceId: string }>;
}

export default function UsersPage({ params }: UsersPageProps) {
  const { deviceId } = use(params);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<DeviceUser | null>(null);
  const userListRef = useRef<UserListHandle>(null);

  const handleUserCreated = () => {
    setShowCreateForm(false);
    userListRef.current?.refresh();
  };

  const handleUserUpdated = () => {
    setEditingUser(null);
    userListRef.current?.refresh();
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-neutral-100 rounded-lg">
            <Users className="w-8 h-8 text-neutral-900" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              User Management
            </h1>
            <p className="text-sm text-neutral-500">
              Manage device users and their access
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-neutral-900 hover:bg-neutral-800"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* User List */}
      <UserList deviceId={deviceId} onEdit={setEditingUser} ref={userListRef} />

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
  );
}
