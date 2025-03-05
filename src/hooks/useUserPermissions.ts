
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        throw error;
      }
      
      return { role: data?.role as UserRole || 'viewer' };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
