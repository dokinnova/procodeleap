
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = 'admin' | 'editor' | 'viewer';

type PermissionsResult = {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  role: UserRole | null;
  isLoading: boolean;
  isError: boolean;
}

export const useUserPermissions = (): PermissionsResult => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { role: null };
      }
      
      // Get the user's role from app_users table
      const { data, error } = await supabase
        .from('app_users')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user permissions:', error);
        
        // Si el error es porque no se encontró el registro, creamos un registro para el usuario
        if (error.code === 'PGRST116') {
          console.log('Creating new app_user record for:', session.user.email);
          
          // Crear un nuevo registro en app_users con rol admin para este usuario
          const { error: insertError } = await supabase
            .from('app_users')
            .insert({
              user_id: session.user.id,
              email: session.user.email,
              role: 'admin'
            });
            
          if (insertError) {
            console.error('Error creating user record:', insertError);
            toast.error('Error al crear permisos de usuario');
            return { role: 'viewer' as UserRole };
          }
          
          toast.success('Se han creado permisos de administrador para este usuario');
          return { role: 'admin' as UserRole };
        }
        
        return { role: 'viewer' as UserRole };
      }
      
      return { role: data?.role as UserRole || 'viewer' };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Define permissions based on role
  const role = data?.role || null;
  const canCreate = role === 'admin' || role === 'editor';
  const canEdit = role === 'admin' || role === 'editor';
  const canDelete = role === 'admin';

  return {
    canCreate,
    canEdit,
    canDelete,
    role,
    isLoading,
    isError,
  };
};
