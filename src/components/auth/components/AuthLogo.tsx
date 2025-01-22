import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AuthLogo = () => {
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (!siteSettings?.logo_url) return null;

  return (
    <div className="flex justify-center mb-6">
      <div className="w-32 h-32 bg-gray-900 rounded-lg flex items-center justify-center p-4">
        <img
          src={siteSettings.logo_url}
          alt="Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};