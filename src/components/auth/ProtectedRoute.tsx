
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { AuthLoading } from "./components/AuthLoading";
import { AuthRequired } from "./components/AuthRequired";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuthRedirect();
  
  if (loading) {
    return <AuthLoading />;
  }

  if (!session) {
    return <AuthRequired />;
  }

  return <>{children}</>;
};
