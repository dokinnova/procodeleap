
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

export type AppUser = Database['public']['Tables']['app_users']['Row'];
export type AuthUserInfo = {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
};

export const syncUsers = async (
  setIsSyncing: (isSyncing: boolean) => void,
  setAuthUsers: React.Dispatch<React.SetStateAction<Record<string, AuthUserInfo>>>,
  queryClient: QueryClient
): Promise<void> => {
  setIsSyncing(true);
  try {
    // First, get all users from app_users
    const { data: existingAppUsers, error } = await supabase
      .from("app_users")
      .select("*");
    
    if (error) throw error;
    
    // Create a set of emails for fast lookup
    const existingEmails = new Set();
    if (existingAppUsers) {
      existingAppUsers.forEach(user => {
        if (user.email) {
          existingEmails.add(user.email.toLowerCase());
        }
      });
    }
    
    // Check if there is a currently authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const currentUser = session.user;
      
      // Check if the current user is already in app_users
      if (currentUser.email && !existingEmails.has(currentUser.email.toLowerCase())) {
        console.log("Adding current user to app_users:", currentUser.email);
        
        const { error: insertError } = await supabase
          .from("app_users")
          .insert({
            email: currentUser.email,
            user_id: currentUser.id,
            role: 'admin' // First user added is admin
          });
          
        if (insertError) {
          console.error("Error inserting current user:", insertError);
          toast.error("Error syncing current user");
        } else {
          toast.success("Current user synced successfully");
        }
      } else {
        // Look for users with email equal to current but with temporary user_id
        const { data: tempUsers } = await supabase
          .from("app_users")
          .select("*")
          .eq("email", currentUser.email.toLowerCase())
          .eq("user_id", "00000000-0000-0000-0000-000000000000");

        if (tempUsers && tempUsers.length > 0) {
          // Update temporary user_id with current
          const { error: updateError } = await supabase
            .from("app_users")
            .update({ user_id: currentUser.id })
            .eq("email", currentUser.email.toLowerCase())
            .eq("user_id", "00000000-0000-0000-0000-000000000000");

          if (updateError) {
            console.error("Error updating temporary user_id:", updateError);
            toast.error("Error updating user sync");
          } else {
            toast.success("User synced successfully");
          }
        }
      }

      // Update last authentication info for current user
      // This ensures we always have at least the current user's information
      if (currentUser.id) {
        const userInfo: AuthUserInfo = {
          id: currentUser.id,
          email: currentUser.email || '',
          last_sign_in_at: currentUser.last_sign_in_at || new Date().toISOString(),
          created_at: currentUser.created_at || new Date().toISOString()
        };
        
        setAuthUsers(prevUsers => ({
          ...prevUsers,
          [currentUser.id]: userInfo
        }));
      }
    }

    // Synchronize existing records with email but temporary user_id
    if (existingAppUsers) {
      const incompleteUsers = existingAppUsers.filter(user => 
        user.user_id === "00000000-0000-0000-0000-000000000000" && user.email);
      
      if (incompleteUsers.length > 0) {
        toast.info(`There are ${incompleteUsers.length} users pending synchronization.`);
      }
    }

    // Try to get additional auth.users information through the Supabase API
    try {
      // This query will only work if the user has admin permissions
      const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authUsersData && authUsersData.users) {
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
        setAuthUsers(userMap);
      }
    } catch (authError) {
      console.warn("Could not access auth.users information:", authError);
      
      // Try to get users through metadata API (might work even without admin)
      try {
        // For non-admin users, at least try to get all confirmed users
        const { data: confirmedUsers, error: confirmedError } = await supabase
          .from("app_users")
          .select("*")
          .neq("user_id", "00000000-0000-0000-0000-000000000000");
        
        if (!confirmedError && confirmedUsers && confirmedUsers.length > 0) {
          // For each confirmed user, try to update their last sign-in time
          const userMap: Record<string, AuthUserInfo> = {};
          
          // First, add the current user's info
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const currentUser = session.user;
            userMap[currentUser.id] = {
              id: currentUser.id,
              email: currentUser.email || '',
              last_sign_in_at: currentUser.last_sign_in_at || new Date().toISOString(),
              created_at: currentUser.created_at || new Date().toISOString()
            };
          }
          
          // For other confirmed users, set a default "confirmed" date
          confirmedUsers.forEach(user => {
            if (user.user_id && user.user_id !== "00000000-0000-0000-0000-000000000000") {
              // If not the current user, use created_at as last_sign_in
              if (!userMap[user.user_id]) {
                userMap[user.user_id] = {
                  id: user.user_id,
                  email: user.email || '',
                  last_sign_in_at: user.created_at || new Date().toISOString(),
                  created_at: user.created_at || new Date().toISOString()
                };
              }
            }
          });
          
          setAuthUsers(userMap);
        }
      } catch (confirmedError) {
        console.warn("Could not get confirmed users:", confirmedError);
      }
    }

    // Refresh the query to show changes
    queryClient.invalidateQueries({ queryKey: ["app-users"] });
    toast.success("Synchronization completed");
  } catch (error: any) {
    console.error("General error syncing users:", error);
    toast.error("Error syncing users: " + error.message);
  } finally {
    setIsSyncing(false);
  }
};
