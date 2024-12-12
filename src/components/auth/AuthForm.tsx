import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

export const AuthForm = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0f172a',
                  brandAccent: '#1e293b',
                }
              }
            },
            className: {
              container: 'w-full',
              button: 'w-full',
              input: 'rounded-md',
            }
          }}
          theme="light"
          providers={[]}
        />
      </CardContent>
    </Card>
  );
};