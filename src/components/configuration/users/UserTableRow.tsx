
import { TableCell, TableRow } from "@/components/ui/table";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserRoleEditor } from "./UserRoleEditor";
import { UserActions } from "./UserActions";
import { UserRole } from "@/hooks/useUserPermissions";
import { AppUser, AuthUserInfo } from "../utils/userSync";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface UserTableRowProps {
  user: AppUser;
  authUsers: Record<string, AuthUserInfo>;
  isCurrentUser: boolean;
  editingUser: AppUser | null;
  onEditClick: (user: AppUser) => void;
  onSaveRole: (userId: string, role: UserRole) => void;
  onDeleteClick: (userId: string) => void;
}

export const UserTableRow = ({
  user,
  authUsers,
  isCurrentUser,
  editingUser,
  onEditClick,
  onSaveRole,
  onDeleteClick
}: UserTableRowProps) => {
  const isPending = user.user_id === "00000000-0000-0000-0000-000000000000";
  const isEditing = editingUser?.id === user.id;
  const authUserData = authUsers[user.user_id];

  const formatLastSignIn = (lastSignIn: string | null | undefined) => {
    if (!lastSignIn) return "Nunca";
    try {
      return format(new Date(lastSignIn), "dd/MM/yyyy HH:mm:ss", { locale: es });
    } catch (e) {
      console.error("Error formatting date:", e, "Value received:", lastSignIn);
      return "Fecha inválida";
    }
  };

  // If the user has a non-temporary user_id, they're confirmed,
  // so we should show at least their creation date as last sign in
  let lastSignInDate = authUserData?.last_sign_in_at;
  if (!isPending && !lastSignInDate) {
    // For confirmed users without auth data, use their creation date
    lastSignInDate = user.created_at;
  }
  
  // For current user without auth data, use current date
  if (isCurrentUser && !lastSignInDate) {
    lastSignInDate = new Date().toISOString();
  }

  // A user is considered to have never logged in ONLY if:
  // 1. They are pending (temporary user_id) - these users haven't signed in yet
  // Any user with a confirmed user_id has logged in at least once
  const hasNeverLoggedIn = isPending;

  return (
    <TableRow className={hasNeverLoggedIn ? "bg-amber-50" : ""}>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <UserRoleEditor 
          user={user} 
          isEditing={isEditing} 
          onSave={onSaveRole}
        />
      </TableCell>
      <TableCell>
        <UserStatusBadge 
          isPending={isPending} 
          isRegisteredButNotLoggedIn={false}
        />
      </TableCell>
      <TableCell>
        {isPending ? 
          "Pendiente" : 
          lastSignInDate ? 
            formatLastSignIn(lastSignInDate) : 
            "Información no disponible"}
      </TableCell>
      <TableCell>
        <UserActions 
          user={user}
          isCurrentUser={isCurrentUser}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          isEditingAny={editingUser !== null}
        />
      </TableCell>
    </TableRow>
  );
};
