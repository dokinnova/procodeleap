
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  role: string;
}

interface UserSelectorProps {
  assignedUserId: string | null;
  onUserSelect: (userId: string | null) => void;
}

export const UserSelector = ({ assignedUserId, onUserSelect }: UserSelectorProps) => {
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["app-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_users")
        .select("*");
      
      if (error) throw error;
      return data as User[];
    },
  });

  console.log("UserSelector - users:", users);
  console.log("UserSelector - assignedUserId:", assignedUserId);

  return (
    <div className="space-y-2">
      <Label htmlFor="assign-user">Asignar a usuario</Label>
      <Select
        value={assignedUserId || "unassigned"}
        onValueChange={(value) => {
          console.log("UserSelector - selected value:", value);
          onUserSelect(value === "unassigned" ? null : value);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar usuario" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Sin asignar</SelectItem>
          {users && users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.email} ({user.role})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && <p className="text-sm text-muted-foreground">Cargando usuarios...</p>}
      {isError && <p className="text-sm text-destructive">Error al cargar usuarios</p>}
    </div>
  );
};
