
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppUser, AuthUserInfo } from "./types/user-types";
import { getCurrentUserInfo } from "./auth-user-utils";

export const getConfirmedUsersInfo = async (): Promise<Record<string, AuthUserInfo>> => {
  try {
    // For non-admin users, at least try to get all confirmed users
    const { data: confirmedUsers, error: confirmedError } = await supabase
      .from("app_users")
      .select("*")
      .neq("user_id", "00000000-0000-0000-0000-000000000000");
    
    if (confirmedError || !confirmedUsers || confirmedUsers.length === 0) {
      return {};
    }
    
    // For each confirmed user, try to update their last sign-in time
    const userMap: Record<string, AuthUserInfo> = {};
    
    // First, add the current user's info
    const currentUser = await getCurrentUserInfo();
    if (currentUser) {
      userMap[currentUser.id] = currentUser;
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
    
    return userMap;
  } catch (error) {
    console.warn("Could not get confirmed users:", error);
    return {};
  }
};

export const syncCurrentUserWithAppUsers = async (): Promise<boolean> => {
  try {
    // Check if there is a currently authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;
    
    const currentUser = session.user;
    
    // Check if the current user email exists in app_users
    const { data: existingUsers, error } = await supabase
      .from("app_users")
      .select("*")
      .eq("email", currentUser.email?.toLowerCase() || '');
    
    if (error) {
      console.error("Error checking for existing user:", error);
      return false;
    }
    
    // If user doesn't exist in app_users at all
    if (!existingUsers || existingUsers.length === 0) {
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
        return false;
      }
      
      toast.success("Current user synced successfully");
      return true;
    } 
    
    // Check for users with matching email but temporary user_id
    const tempUsers = existingUsers.filter(user => 
      user.user_id === "00000000-0000-0000-0000-000000000000"
    );
    
    if (tempUsers.length > 0) {
      // Update temporary user_id with current
      const { error: updateError } = await supabase
        .from("app_users")
        .update({ user_id: currentUser.id })
        .eq("email", currentUser.email?.toLowerCase() || '')
        .eq("user_id", "00000000-0000-0000-0000-000000000000");

      if (updateError) {
        console.error("Error updating temporary user_id:", updateError);
        toast.error("Error updating user sync");
        return false;
      }
      
      toast.success("User synced successfully");
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error syncing current user:", error);
    return false;
  }
};
