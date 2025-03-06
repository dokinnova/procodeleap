
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
        .select('role, email')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user permissions:', error);
        
        // If the user doesn't exist in app_users yet (PGRST116 = no rows returned)
        if (error.code === 'PGRST116') {
          console.log('Creating new app_user record for:', session.user.email);
          
          // Check if there's a record with this email but empty user_id
          const { data: emailRecord, error: emailError } = await supabase
            .from('app_users')
            .select('*')
            .eq('email', session.user.email);
            
          if (!emailError && emailRecord && emailRecord.length > 0) {
            // Update the existing record with the user_id
            const { error: updateError } = await supabase
              .from('app_users')
              .update({ user_id: session.user.id })
              .eq('email', session.user.email);
              
            if (updateError) {
              console.error('Error updating user record:', updateError);
              toast.error('Error al actualizar permisos de usuario');
              return { role: 'viewer' as UserRole };
            }
            
            return { role: emailRecord[0].role as UserRole };
          }
          
          // Create a new record in app_users with role admin for this user
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

  // If someone tries to access functionality they don't have permission for,
  // show a toast message
  const checkPermission = (action: 'create' | 'edit' | 'delete'): boolean => {
    const hasPermission = action === 'create' ? canCreate : 
                         action === 'edit' ? canEdit : 
                         action === 'delete' ? canDelete : false;
    
    if (!hasPermission) {
      toast.error(`No tienes permisos para ${
        action === 'create' ? 'crear' : 
        action === 'edit' ? 'editar' : 
        'eliminar'
      } registros`);
    }
    
    return hasPermission;
  };

  return {
    canCreate,
    canEdit,
    canDelete,
    role,
    isLoading,
    isError,
    checkPermission,
  };
};
