
import {
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@/components/ui/table";
import { UserTableRow } from "./users/UserTableRow";
import { UserStats } from "./users/UserStats";
import { UsersTableHeader } from "./users/UsersTableHeader";
import { useUsersData } from "./hooks/useUsersData";
import { useUserActions } from "./hooks/useUserActions";

export const AppUsersTable = () => {
  const { 
    appUsers, 
    isLoading, 
    isSyncing, 
    authUsers, 
    isCurrentUser, 
    handleManualSync 
  } = useUsersData();

  const {
    editingUser,
    handleEditClick,
    handleSaveRole,
    handleDeleteUser,
  } = useUserActions();

  if (isLoading || isSyncing) {
    return <div>Cargando usuarios...</div>;
  }

  console.log("Renderizando usuarios:", appUsers);
  
  // Asegurarse de que appUsers es un array antes de intentar renderizarlo
  const usersToRender = Array.isArray(appUsers) ? appUsers : [];
  
  // Verificar si hay usuarios pendientes
  const pendingUsers = usersToRender.filter(user => 
    user.user_id === "00000000-0000-0000-0000-000000000000"
  );

  return (
    <div className="space-y-4">
      <UserStats 
        users={usersToRender}
        pendingUsers={pendingUsers}
        isSyncing={isSyncing}
        onSyncClick={handleManualSync}
      />
      
      <Table>
        <UsersTableHeader />
        <TableBody>
          {usersToRender.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            usersToRender.map((user) => (
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
