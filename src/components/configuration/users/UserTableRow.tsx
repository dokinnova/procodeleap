
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

  const formatLastSignIn = (lastSignIn: string | null | undefined) => {
    if (!lastSignIn) return "Nunca";
    try {
      return format(new Date(lastSignIn), "dd/MM/yyyy HH:mm:ss", { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  return (
    <TableRow className={isPending ? "bg-amber-50" : ""}>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <UserRoleEditor 
          user={user} 
          isEditing={isEditing} 
          onSave={onSaveRole}
        />
      </TableCell>
      <TableCell>
        <UserStatusBadge isPending={isPending} />
      </TableCell>
      <TableCell>
        {!isPending && 
         authUsers[user.user_id] && 
         'last_sign_in_at' in authUsers[user.user_id] ? 
          formatLastSignIn(authUsers[user.user_id].last_sign_in_at) : 
          "Pendiente"}
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
