
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
      console.error("Error formateando fecha:", e, "Valor recibido:", lastSignIn);
      return "Fecha inválida";
    }
  };

  // Para depuración - Ver qué datos tenemos para este usuario
  const authUserData = authUsers[user.user_id];
  console.log(`Usuario ${user.email}:`, { 
    user_id: user.user_id, 
    authUserData: authUserData,
    lastSignIn: authUserData?.last_sign_in_at 
  });

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
        {!isPending && authUserData ? 
          formatLastSignIn(authUserData.last_sign_in_at) : 
          isPending ? "Pendiente" : "Información no disponible"}
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
