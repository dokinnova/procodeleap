
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

  const handleLogout = async () => {
    try {
      console.log("Attempting to sign out...");
      
      // First check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error checking session before logout:", sessionError);
        throw sessionError;
      }
      
      if (!session) {
        // If no session, just redirect to auth page
        console.log("No active session found");
        toast("Session ended", {
          description: "No active session",
        });
        navigate("/auth", { replace: true });
        return;
      }
      
      // If we have a session, try to sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during signOut:", error);
        throw error;
      }

      // Show success toast
      toast("Session closed", {
        description: "You have successfully signed out",
      });

      // Force navigation to login
      navigate("/auth", { replace: true });
    } catch (error: any) {
      console.error("Error signing out:", error);
      uiToast({
        title: "Error",
        description: "Could not sign out properly. Redirecting to sign in.",
        variant: "destructive",
      });
      
      // Even if there's an error, redirect to auth page
      navigate("/auth", { replace: true });
    }
  };

  return (
    <div className="flex justify-between items-center pb-4 border-b border-purple-100">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">Control Panel</h2>
        <p className="text-muted-foreground text-sm">
          COPRODELI management system
        </p>
      </div>
      <Button 
        variant="outline" 
        onClick={handleLogout}
        size="sm"
        className="flex items-center gap-2 border-violet-200 hover:bg-violet-50"
      >
        <LogOut className="h-4 w-4 text-violet-600" />
        Sign out
      </Button>
    </div>
  );
};
