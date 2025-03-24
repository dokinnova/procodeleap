
import { useState } from "react";
import { AppUser } from "../utils/user-sync";
import { UserRole } from "@/hooks/useUserPermissions";
import { useUserRoleActions } from "./user-actions/useUserRoleActions";
import { useUserDeletion } from "./user-actions/useUserDeletion";
import { usePasswordManagement } from "./user-actions/usePasswordManagement";

export const useUserActions = () => {
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [passwordChangeUser, setPasswordChangeUser] = useState<{ id: string; email: string } | null>(null);

  const { handleSaveRole, setUserAsAdmin } = useUserRoleActions();
  const { handleDeleteUser } = useUserDeletion();
  const { 
    handleSendPasswordResetEmail,
    handleDirectPasswordChange: directPasswordChange,
    isPasswordResetLoading,
    passwordResetError,
    passwordResetSuccess,
    isPasswordChangeLoading,
    passwordChangeError,
    passwordChangeSuccess
  } = usePasswordManagement();

  const handleEditClick = (user: AppUser) => {
    setEditingUser(user);
  };

  const handleChangePasswordClick = (userId: string, email: string) => {
    console.log("Abriendo diálogo de cambio de contraseña para:", email);
    if (userId && email) {
      setPasswordChangeUser({ id: userId, email });
    }
  };

  const handleDirectPasswordChange = (email: string, newPassword: string) => {
    if (passwordChangeUser) {
      directPasswordChange(email, newPassword, passwordChangeUser.id);
    }
  };

  return {
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
    handleDirectPasswordChange,
    isPasswordChangeLoading,
    passwordChangeError,
    passwordChangeSuccess,
  };
};
