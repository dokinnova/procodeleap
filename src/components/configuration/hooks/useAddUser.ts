
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserRole } from "@/hooks/useUserPermissions";
import { checkExistingUser } from "./user-operations/checkExistingUser";
import { createAuthUser } from "./user-operations/createAuthUser";
import { createAppUser } from "./user-operations/createAppUser";
import { sendWelcomeEmail } from "./user-operations/sendWelcomeEmail";

type AddUserParams = {
  email: string;
  password: string;
  userRole: UserRole;
};

export const useAddUser = () => {
  const queryClient = useQueryClient();
  
  const addUserMutation = useMutation({
    mutationFn: async ({ email, password, userRole }: AddUserParams) => {
      try {
        // Step 1: Check if user already exists
        const userExists = await checkExistingUser(email);
        if (userExists) {
          throw new Error("Este usuario ya existe en el sistema");
        }

        // Step 2: Create auth user
        const { userId, userExists: authUserExists } = await createAuthUser({ 
          email, 
          password, 
          userRole 
        });
        
        // Step 3: Create app_user record
        await createAppUser({ email, userRole, userId });
        
        // Step 4: Send welcome email
        const result = await sendWelcomeEmail({ email, userRole });
        
        // Step 5: Invalidate queries to force a refresh
        queryClient.invalidateQueries({ queryKey: ["app-users"] });
        
        return result;
      } catch (error: any) {
        console.error("Error in registration process:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if ('message' in data) {
        toast.success(data.message);
      } else {
        toast.success("Usuario añadido correctamente. Se ha enviado un correo de verificación.");
      }
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
    },
    onError: (error: any) => {
      toast.error("Error al añadir usuario: " + error.message);
    },
  });

  return { addUserMutation };
};
