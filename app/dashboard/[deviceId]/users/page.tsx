// app/dashboard/[deviceId]/users/page.tsx

"use client";

import { use, useState, useRef } from "react";
import { motion } from "framer-motion";
import UserList, {
  UserListHandle,
} from "@/components/smartlock/users/UserList";
import CreateUserForm from "@/components/smartlock/users/CreateUserForm";
import EditUserModal from "@/components/smartlock/users/EditUserModal";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="p-3 bg-muted rounded-lg"
            >
              <Users className="w-6 h-6 md:w-7 md:h-7" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                User Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage device users and their access
              </p>
            </div>
          </div>

          <Button onClick={() => setShowCreateForm(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
        <Separator />
      </motion.div>

      {/* User List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <UserList
          deviceId={deviceId}
          onEdit={setEditingUser}
          ref={userListRef}
        />
      </motion.div>

      {/* Create User Dialog */}
      {showCreateForm && (
        <CreateUserForm
          deviceId={deviceId}
          onSuccess={handleUserCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit User Dialog */}
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
