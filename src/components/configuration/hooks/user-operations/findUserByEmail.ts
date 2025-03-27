
import { supabase } from "@/integrations/supabase/client";

/**
 * Attempts to find a user by email in the auth users list
 */
export const findUserByEmail = async (email: string): Promise<string | null> => {
  try {
    console.log("Trying to find user by email:", email);
    
    // Get all users and then filter on the client side
    const { data: authUsersData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError || !authUsersData) {
      console.error("Error listing users:", listError);
      return null;
    }
    
    console.log("Total users found:", authUsersData.users.length);
    
    // Find the user with the matching email by filtering on the client side
    const foundUser = authUsersData.users.find((user: any) => {
      // Ensure user object and email property exist before comparing
      const match = user && typeof user.email === 'string' && 
             user.email.toLowerCase() === email.toLowerCase();
      if (match) {
        console.log("User found:", user.email, "ID:", user.id);
      }
      return match;
    });
    
    if (foundUser) {
      console.log("Found user ID:", foundUser.id, "for email:", email);
      return foundUser.id;
    } else {
      console.log("User not found in auth users list for email:", email);
      return null;
    }
  } catch (findError) {
    console.error("Error finding user:", findError);
    return null;
  }
};
