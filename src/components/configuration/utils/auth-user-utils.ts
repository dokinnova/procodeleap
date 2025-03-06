
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthUserInfo } from "./types/user-types";

export const getCurrentUserInfo = async (): Promise<AuthUserInfo | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return null;
    
    const currentUser = session.user;
    return {
      id: currentUser.id,
      email: currentUser.email || '',
      last_sign_in_at: currentUser.last_sign_in_at || new Date().toISOString(),
      created_at: currentUser.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting current user info:", error);
    return null;
  }
};

export const tryGetAuthUsersData = async (): Promise<Record<string, AuthUserInfo>> => {
  try {
    // This query will only work if the user has admin permissions
    const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError || !authUsersData?.users) {
      return {};
    }
    
    const userMap: Record<string, AuthUserInfo> = {};
    
    // Type assertion to define the correct type
    const users = authUsersData.users as Array<{
      id: string;
      email: string | null;
      last_sign_in_at: string | null;
      created_at: string;
    }>;
    
    users.forEach(user => {
      if (user && user.id) {
        userMap[user.id] = {
          id: user.id,
          email: user.email || '',
          last_sign_in_at: user.last_sign_in_at,
          created_at: user.created_at
        };
      }
    });
    
    return userMap;
  } catch (error) {
    console.warn("Could not access auth.users information:", error);
    return {};
  }
};
