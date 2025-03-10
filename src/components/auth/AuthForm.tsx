
import { Card, CardContent } from "@/components/ui/card";
import { AuthContainer } from "./components/AuthContainer";
import { AuthProvider } from "./components/AuthProvider";
import { AuthLogo } from "./components/AuthLogo";
import { AuthFormWrapper } from "./components/AuthFormWrapper";

export const AuthForm = () => {
  return (
    <AuthProvider>
      <AuthContainer>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <AuthLogo />
            <div className="w-full">
              <AuthFormWrapper />
            </div>
          </CardContent>
        </Card>
      </AuthContainer>
    </AuthProvider>
  );
};
