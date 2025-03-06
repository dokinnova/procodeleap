import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { UserRole } from "@/hooks/useUserPermissions";
import { UserTableRow } from "./users/UserTableRow";
import { UserStats } from "./users/UserStats";
import { AppUser, AuthUserInfo, syncUsers } from "./utils/userSync";

export const AppUsersTable = () => {
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authUsers, setAuthUsers] = useState<Record<string, AuthUserInfo>>({});

  // Run synchronization when component loads
  useEffect(() => {
    handleManualSync();
  }, []);

  const { data: appUsers, isLoading } = useQuery({
    queryKey: ["app-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_users")
        .select("*");
      
      if (error) throw error;
      return data as AppUser[];
    },
  });

  // Query to get current authenticated user session
  const { data: sessionData } = useQuery({
    queryKey: ["current-user-session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  });

  // Effect to update authUsers when we have the current session user
  useEffect(() => {
    if (sessionData?.user) {
      const currentUser = sessionData.user;
      setAuthUsers(prevAuthUsers => ({
        ...prevAuthUsers,
        [currentUser.id]: {
          id: currentUser.id,
          email: currentUser.email || '',
          last_sign_in_at: currentUser.last_sign_in_at || new Date().toISOString(),
          created_at: currentUser.created_at || new Date().toISOString()
        }
      }));
    }
  }, [sessionData]);

  // Effect to update auth data for confirmed users
  useEffect(() => {
    if (appUsers) {
      // For all confirmed users (with a real user_id),
      // make sure they have at least a created_at date
      const confirmedUsers = appUsers.filter(
        user => user.user_id !== "00000000-0000-0000-0000-000000000000"
      );
      
      if (confirmedUsers.length > 0) {
        const updatedAuthUsers = { ...authUsers };
        
        confirmedUsers.forEach(user => {
          if (!updatedAuthUsers[user.user_id]) {
            updatedAuthUsers[user.user_id] = {
              id: user.user_id,
              email: user.email || '',
              last_sign_in_at: user.created_at,
              created_at: user.created_at
            };
          }
        });
        
        // Only update if there are new entries
        if (Object.keys(updatedAuthUsers).length > Object.keys(authUsers).length) {
          setAuthUsers(updatedAuthUsers);
        }
      }
    }
  }, [appUsers, authUsers]);

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Don't allow deleting users with temporary user_id
      if (userId === "00000000-0000-0000-0000-000000000000") {
        throw new Error("Cannot delete a user who hasn't logged in yet");
      }
      
      const { error } = await supabase
        .from("app_users")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error("Error deleting user: " + error.message);
      setUserToDelete(null);
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      const { error } = await supabase
        .from("app_users")
        .update({ role })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error("Error updating user role: " + error.message);
    },
  });

  const handleEditClick = (user: AppUser) => {
    setEditingUser(user);
  };

  const handleSaveRole = (userId: string, role: UserRole) => {
    updateUserRoleMutation.mutate({ userId, role });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleManualSync = () => {
    syncUsers(setIsSyncing, setAuthUsers, queryClient);
  };

  // Check if current user is the user in the row
  const isCurrentUser = (userId: string) => {
    return sessionData?.user?.id === userId;
  };

  if (isLoading || isSyncing) {
    return <div>Loading users...</div>;
  }

  // Display all users, including pending ones
  return (
    <div className="space-y-4">
      <UserStats 
        users={appUsers}
        pendingUsers={appUsers?.filter(user => user.user_id === "00000000-0000-0000-0000-000000000000") || []}
        isSyncing={isSyncing}
        onSyncClick={handleManualSync}
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Última autenticación</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appUsers?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            appUsers?.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                authUsers={authUsers}
                isCurrentUser={isCurrentUser(user.user_id)}
                editingUser={editingUser}
                onEditClick={handleEditClick}
                onSaveRole={handleSaveRole}
                onDeleteClick={handleDeleteUser}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
