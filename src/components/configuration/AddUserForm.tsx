
import { useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UserRole } from "@/hooks/useUserPermissions";
import { useAddUser } from "./hooks/useAddUser";

export const AddUserForm = () => {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("viewer");
  const [showPassword, setShowPassword] = useState(false);

  const { addUserMutation } = useAddUser();

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail) {
      toast.error("Por favor, introduce un email");
      return;
    }
    
    if (!newUserPassword || newUserPassword.length < 6) {
      toast.error("Por favor, introduce una contraseña de al menos 6 caracteres");
      return;
    }
    
    addUserMutation.mutate({ 
      email: newUserEmail, 
      password: newUserPassword, 
      userRole: newUserRole 
    }, {
      onSuccess: () => {
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserRole("viewer");
      }
    });
  };

  return (
    <form onSubmit={handleAddUser} className="space-y-4">
      <div className="max-w-md mx-auto">
        <Input
          type="email"
          placeholder="Email del nuevo usuario"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          className="mb-2 w-full"
        />
        <div className="relative mb-2">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña del nuevo usuario"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            className="w-full"
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <Select 
          value={newUserRole} 
          onValueChange={(value) => setNewUserRole(value as UserRole)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Visualizador</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-center">
        <Button type="submit">
          <UserPlus className="w-4 h-4 mr-2" />
          Añadir Usuario
        </Button>
      </div>
    </form>
  );
};
