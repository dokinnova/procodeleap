import { Link, useLocation } from "react-router-dom";
import { Users, UserPlus, Settings, School } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

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
    <div className="flex h-screen">
      <div className="w-64 bg-[#F1F0FB] fixed h-full shadow-sm transition-all duration-300 ease-in-out">
        <div className="p-6 border-b border-purple-100/30 bg-[#E6E4F4] backdrop-blur-sm">
          <Link to="/" className="text-xl font-semibold text-gray-900 hover:opacity-80 transition-opacity flex items-center gap-3">
            PROCODELI
            {siteSettings?.logo_url && (
              <img 
                src={siteSettings.logo_url} 
                alt="Logo" 
                className="w-8 h-8 object-contain rounded-full shadow-sm"
              />
            )}
          </Link>
        </div>
        <nav className="mt-6 px-3">
          <Link
            to="/children"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              isActive("/children") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            <span className="font-medium">Niños</span>
          </Link>
          <Link
            to="/sponsors"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              isActive("/sponsors") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <UserPlus className="w-5 h-5 mr-3" />
            <span className="font-medium">Padrinos</span>
          </Link>
          <Link
            to="/schools"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              isActive("/schools") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <School className="w-5 h-5 mr-3" />
            <span className="font-medium">Colegios</span>
          </Link>
          <Link
            to="/management"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              isActive("/management") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium">Gestión</span>
          </Link>
          <Link
            to="/configuration"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              isActive("/configuration") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium">Configuración</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Navigation;