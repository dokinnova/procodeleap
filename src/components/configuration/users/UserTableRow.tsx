
import { TableCell, TableRow } from "@/components/ui/table";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserRoleEditor } from "./UserRoleEditor";
import { UserActions } from "./UserActions";
import { UserRole } from "@/hooks/useUserPermissions";
import { AppUser, AuthUserInfo } from "../utils/user-sync";
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
  onChangePasswordClick: (userId: string, email: string) => void;
}

export const UserTableRow = ({
  user,
  authUsers,
  isCurrentUser,
  editingUser,
  onEditClick,
  onSaveRole,
  onDeleteClick,
  onChangePasswordClick
}: UserTableRowProps) => {
  // Un usuario está pendiente si tiene el user_id temporal
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

  // Si el usuario tiene un user_id no temporal, está confirmado
  let lastSignInDate = authUserData?.last_sign_in_at;
  if (!isPending && !lastSignInDate) {
    // Para usuarios confirmados sin datos de auth, usar su fecha de creación
    lastSignInDate = user.created_at;
  }
  
  // Para el usuario actual sin datos de auth, usar la fecha actual
  if (isCurrentUser && !lastSignInDate) {
    lastSignInDate = new Date().toISOString();
  }

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
          onChangePasswordClick={onChangePasswordClick}
          isEditingAny={editingUser !== null}
        />
      </TableCell>
    </TableRow>
  );
};
