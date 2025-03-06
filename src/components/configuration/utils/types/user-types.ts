
import { Database } from "@/integrations/supabase/types";

export type AppUser = Database['public']['Tables']['app_users']['Row'];
export type AuthUserInfo = {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
};
