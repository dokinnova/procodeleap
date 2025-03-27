import { supabase } from "@/integrations/supabase/client";

/**
 * Attempts to find a user by email in the auth users list
 */
export const findUserByEmail = async (email: string): Promise<string | null> => {
  try {
    console.log("Trying to find user by email:", email);
    const normalizedEmail = email.trim().toLowerCase();
    
    // First try: Direct lookup by email via sign-in attempt
    try {
      // We use a sign in attempt with incorrect password to check if user exists
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: "ThisIsAFakePasswordForCheckingOnly123!@#"
      });
      
      // If we get "Invalid login credentials", the user exists
      if (error && error.message && error.message.includes("Invalid login credentials")) {
        console.log("User exists in auth system based on sign-in attempt");
        
        // Now try to get the user ID from app_users
        const { data: userData, error: userError } = await supabase
          .from("app_users")
          .select("user_id")
          .eq("email", normalizedEmail)
          .not("user_id", "00000000-0000-0000-0000-000000000000")
          .maybeSingle();
        
        if (!userError && userData && userData.user_id) {
          console.log("Found user ID in app_users:", userData.user_id);
          return userData.user_id;
        }
      } else {
        console.log("User does not exist in auth system or other error occurred:", error?.message);
      }
    } catch (directError) {
      console.log("Error in direct lookup:", directError);
    }
    
    // Second try: Use admin API to list users (requires admin privileges)
    try {
      const { data: authUsersData, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.log("Cannot access admin.listUsers:", listError.message);
      } else if (authUsersData && authUsersData.users) {
        console.log("Total users found:", authUsersData.users.length);
        
        // Find the user with the matching email
        const foundUser = authUsersData.users.find((user: any) => {
          return user && typeof user.email === 'string' && 
                 user.email.toLowerCase() === email.toLowerCase();
        });
        
        if (foundUser) {
          console.log("Found user ID:", foundUser.id, "for email:", email);
          return foundUser.id;
        }
      }
    } catch (adminError) {
      console.log("Error in admin lookup:", adminError);
    }
    
    // Third try: Attempt to get the session if this user is the current user
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData && sessionData.session && sessionData.session.user) {
        if (sessionData.session.user.email?.toLowerCase() === email.toLowerCase()) {
          console.log("Found user ID from session:", sessionData.session.user.id);
          return sessionData.session.user.id;
        }
      }
    } catch (sessionError) {
      console.log("Error getting session:", sessionError);
    }
    
    console.log("User not found with email:", email);
    return null;
  } catch (findError) {
    console.error("Error finding user:", findError);
    return null;
  }
};
