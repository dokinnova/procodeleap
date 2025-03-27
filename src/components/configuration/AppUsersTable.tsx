
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
import { PasswordChangeDialog } from "./users/PasswordChangeDialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export const AppUsersTable = () => {
  const [emailToDelete, setEmailToDelete] = useState<string>("");
  
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
    passwordChangeUser,
    handleEditClick,
    handleSaveRole,
    handleDeleteUser,
    handleChangePasswordClick,
    setPasswordChangeUser,
    handleSendPasswordResetEmail,
    isPasswordResetLoading,
    passwordResetError,
    passwordResetSuccess,
    setUserAsAdmin,
    // Direct password change actions
    handleDirectPasswordChange,
    isPasswordChangeLoading,
    passwordChangeError,
    passwordChangeSuccess,
    deleteByEmail
  } = useUserActions();

  useEffect(() => {
    const targetEmail = "jose.newcar@gmail.com";
    
    if (appUsers && Array.isArray(appUsers)) {
      const joseUser = appUsers.find(user => user.email === targetEmail);
      
      if (joseUser) {
        // Only update if the user doesn't already have admin role
        if (joseUser.role !== 'admin') {
          setUserAsAdmin(targetEmail);
          toast.success(`Asignando permisos de administrador a ${targetEmail}`);
        } else {
          console.log(`${targetEmail} ya tiene permisos de administrador`);
        }
      } else {
        console.log(`Usuario ${targetEmail} no encontrado en la lista de usuarios`);
      }
    }
  }, [appUsers, setUserAsAdmin]);

  const handleDeleteByEmail = () => {
    if (emailToDelete) {
      deleteByEmail(emailToDelete);
      setEmailToDelete("");
    } else {
      toast.error("Por favor, ingresa un email para eliminar");
    }
  };

  if (isLoading || isSyncing) {
    return <div>Cargando usuarios...</div>;
  }

  console.log("Renderizando usuarios:", appUsers);
  
  const usersToRender = Array.isArray(appUsers) ? appUsers : [];
  
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

      <div className="bg-amber-50 p-4 rounded-md mb-4">
        <p className="text-amber-800">
          Asignando permisos de administrador a jose.newcar@gmail.com
        </p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-md mb-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
          Eliminar usuario por email
        </h3>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email del usuario a eliminar"
            value={emailToDelete}
            onChange={(e) => setEmailToDelete(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <Button 
            variant="destructive"
            onClick={handleDeleteByEmail}
          >
            Eliminar
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Esta acción eliminará completamente al usuario de todas las tablas del sistema.
        </p>
      </div>
      
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
                onChangePasswordClick={handleChangePasswordClick}
              />
            ))
          )}
        </TableBody>
      </Table>

      {passwordChangeUser && (
        <PasswordChangeDialog
          open={!!passwordChangeUser}
          onOpenChange={(open) => {
            if (!open) setPasswordChangeUser(null);
          }}
          userId={passwordChangeUser.id}
          userEmail={passwordChangeUser.email}
          onSendResetEmail={handleSendPasswordResetEmail}
          onDirectPasswordChange={handleDirectPasswordChange}
          isLoading={isPasswordResetLoading}
          isDirectChangeLoading={isPasswordChangeLoading}
          error={passwordResetError}
          directChangeError={passwordChangeError}
          success={passwordResetSuccess}
          directChangeSuccess={passwordChangeSuccess}
        />
      )}
    </div>
  );
};
