
import { useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
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
  const [formError, setFormError] = useState<string | null>(null);

  const { addUserMutation } = useAddUser();

  const validatePassword = (password: string) => {
    if (!password) {
      return "La contraseña es obligatoria";
    }
    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    return null;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!newUserEmail) {
      setFormError("Por favor, introduce un email");
      toast.error("Por favor, introduce un email");
      return;
    }
    
    const passwordError = validatePassword(newUserPassword);
    if (passwordError) {
      setFormError(passwordError);
      toast.error(passwordError);
      return;
    }
    
    console.log("Adding new user with email:", newUserEmail, "and role:", newUserRole);
    console.log("Password length for validation:", newUserPassword.length);
    
    addUserMutation.mutate({ 
      email: newUserEmail.trim().toLowerCase(), 
      password: newUserPassword, 
      userRole: newUserRole 
    }, {
      onSuccess: () => {
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserRole("viewer");
        setFormError(null);
      }
    });
  };

  return (
    <form onSubmit={handleAddUser} className="space-y-4">
      <div className="max-w-md mx-auto">
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
            {formError}
          </div>
        )}
        
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
