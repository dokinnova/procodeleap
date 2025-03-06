
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppUser, AuthUserInfo, syncUsers } from "../utils/userSync";

export const useUsersData = () => {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [authUsers, setAuthUsers] = useState<Record<string, AuthUserInfo>>({});

  const { data: appUsers, isLoading } = useQuery({
    queryKey: ["app-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_users")
        .select("*");
      
      if (error) throw error;
      return data as AppUser[];
    },
  });

  // Query to get current authenticated user session
  const { data: sessionData } = useQuery({
    queryKey: ["current-user-session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  });

  // Effect to update authUsers when we have the current session user
  useEffect(() => {
    if (sessionData?.user) {
      const currentUser = sessionData.user;
      setAuthUsers(prevAuthUsers => ({
        ...prevAuthUsers,
        [currentUser.id]: {
          id: currentUser.id,
          email: currentUser.email || '',
          last_sign_in_at: currentUser.last_sign_in_at || new Date().toISOString(),
          created_at: currentUser.created_at || new Date().toISOString()
        }
      }));
    }
  }, [sessionData]);

  // Effect to update auth data for confirmed users
  useEffect(() => {
    if (appUsers) {
      const confirmedUsers = appUsers.filter(
        user => user.user_id !== "00000000-0000-0000-0000-000000000000"
      );
      
      if (confirmedUsers.length > 0) {
        const updatedAuthUsers = { ...authUsers };
        
        confirmedUsers.forEach(user => {
          if (!updatedAuthUsers[user.user_id]) {
            updatedAuthUsers[user.user_id] = {
              id: user.user_id,
              email: user.email || '',
              last_sign_in_at: user.created_at,
              created_at: user.created_at
            };
          }
        });
        
        if (Object.keys(updatedAuthUsers).length > Object.keys(authUsers).length) {
          setAuthUsers(updatedAuthUsers);
        }
      }
    }
  }, [appUsers, authUsers]);

  const handleManualSync = () => {
    syncUsers(setIsSyncing, setAuthUsers, queryClient);
  };

  // Check if current user is the user in the row
  const isCurrentUser = (userId: string) => {
    return sessionData?.user?.id === userId;
  };

  return {
    appUsers,
    isLoading,
    isSyncing,
    authUsers,
    isCurrentUser,
    handleManualSync
  };
};
