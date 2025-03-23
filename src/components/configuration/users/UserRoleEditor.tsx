
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/hooks/useUserPermissions";
import { useState } from "react";
import { AppUser } from "../utils/user-sync";

interface UserRoleEditorProps {
  user: AppUser;
  isEditing: boolean;
  onSave: (userId: string, role: UserRole) => void;
}

export const UserRoleEditor = ({ user, isEditing, onSave }: UserRoleEditorProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role as UserRole);

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as UserRole);
  };

  const handleSaveRole = () => {
    onSave(user.user_id, selectedRole);
  };

  if (!isEditing) {
    return (
      <span className={`px-2 py-1 rounded text-xs ${
        user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
        user.role === 'editor' ? 'bg-green-100 text-green-800' : 
        'bg-gray-100 text-gray-800'
      }`}>
        {user.role === 'admin' ? 'Administrador' : 
         user.role === 'editor' ? 'Editor' : 'Visualizador'}
      </span>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedRole || user.role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecciona un rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Visualizador</SelectItem>
        </SelectContent>
      </Select>
      <Button 
        size="icon" 
        variant="outline" 
        onClick={handleSaveRole}
      >
        <Check className="h-4 w-4" />
      </Button>
    </div>
  );
};
