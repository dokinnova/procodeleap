import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import { tryGetAuthUsersData } from "./auth-user-utils";
import { getConfirmedUsersInfo, syncCurrentUserWithAppUsers } from "./app-user-utils";
import { AuthUserInfo } from "./types/user-types";

export const syncUsers = async (
  setIsSyncing: (isSyncing: boolean) => void,
  setAuthUsers: React.Dispatch<React.SetStateAction<Record<string, AuthUserInfo>>>,
  queryClient: QueryClient
): Promise<void> => {
  setIsSyncing(true);
  try {
    // First, sync the current user
    await syncCurrentUserWithAppUsers();
    
    // Get all users from app_users
    const { data: existingAppUsers, error } = await supabase
      .from("app_users")
      .select("*");
    
    if (error) throw error;
    
    // Check for incomplete users
    if (existingAppUsers) {
      const incompleteUsers = existingAppUsers.filter(user => 
        user.user_id === "00000000-0000-0000-0000-000000000000" && user.email);
      
      if (incompleteUsers.length > 0) {
        toast.info(`There are ${incompleteUsers.length} users pending synchronization.`);
      }
    }

    // Try to get all auth users (admin only)
    const authUsers = await tryGetAuthUsersData();
    
    // If we got auth users data, use it
    if (Object.keys(authUsers).length > 0) {
      setAuthUsers(authUsers);
    } else {
      // Otherwise, fall back to confirmed users data
      const confirmedUsersInfo = await getConfirmedUsersInfo();
      if (Object.keys(confirmedUsersInfo).length > 0) {
        setAuthUsers(confirmedUsersInfo);
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
