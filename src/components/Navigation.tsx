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
      <div className="w-64 bg-gray-900 text-white fixed h-full">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <Link to="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-2">
            PROCODELI
            {siteSettings?.logo_url && (
              <img 
                src={siteSettings.logo_url} 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
            )}
          </Link>
        </div>
        <nav className="mt-6">
          <Link
            to="/children"
            className={`flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${
              isActive("/children") ? "bg-gray-800 border-l-4 border-primary" : ""
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            <span>Niños</span>
          </Link>
          <Link
            to="/sponsors"
            className={`flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${
              isActive("/sponsors") ? "bg-gray-800 border-l-4 border-primary" : ""
            }`}
          >
            <UserPlus className="w-5 h-5 mr-3" />
            <span>Padrinos</span>
          </Link>
          <Link
            to="/schools"
            className={`flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${
              isActive("/schools") ? "bg-gray-800 border-l-4 border-primary" : ""
            }`}
          >
            <School className="w-5 h-5 mr-3" />
            <span>Colegios</span>
          </Link>
          <Link
            to="/management"
            className={`flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${
              isActive("/management") ? "bg-gray-800 border-l-4 border-primary" : ""
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span>Gestión</span>
          </Link>
          <Link
            to="/configuration"
            className={`flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${
              isActive("/configuration") ? "bg-gray-800 border-l-4 border-primary" : ""
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span>Configuración</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Navigation;