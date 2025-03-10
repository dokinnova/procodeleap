
import { useState } from "react";

export const usePasswordValidation = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const validatePasswords = (): { isValid: boolean; error: string | null } => {
    if (password !== confirmPassword) {
      return { 
        isValid: false, 
        error: "Las contraseñas no coinciden" 
      };
    }
    
    if (password.length < 6) {
      return { 
        isValid: false, 
        error: "La contraseña debe tener al menos 6 caracteres" 
      };
    }
    
    return { isValid: true, error: null };
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    validatePasswords
  };
};
