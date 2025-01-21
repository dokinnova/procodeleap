import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NavigationHeaderProps {
  onLogoClick?: () => void;
}

export const NavigationHeader = ({ onLogoClick }: NavigationHeaderProps) => {
  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-6 border-b border-purple-100/30 bg-[#1A1F2C] backdrop-blur-sm">
      <Link 
        to="/" 
        className="text-xl font-semibold text-white hover:opacity-80 transition-opacity flex items-center gap-3"
        onClick={onLogoClick}
      >
        COPRODELI
        {siteSettings?.logo_url && (
          <img 
            src={siteSettings.logo_url} 
            alt="Logo" 
            className="w-8 h-8 object-contain rounded-full shadow-sm"
          />
        )}
      </Link>
    </div>
  );
};