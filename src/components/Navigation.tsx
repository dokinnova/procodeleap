import { Link, useLocation } from "react-router-dom";
import { Users, UserPlus, Settings, School, FileText, BarChart2, Receipt, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";

interface NavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Navigation = ({ isMobileMenuOpen, setIsMobileMenuOpen }: NavigationProps) => {
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

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden"
        onClick={toggleMenu}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Navigation Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#F1F0FB] shadow-sm transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-purple-100/30 bg-[#1A1F2C] backdrop-blur-sm">
          <Link 
            to="/" 
            className="text-xl font-semibold text-white hover:opacity-80 transition-opacity flex items-center gap-3"
            onClick={() => setIsMobileMenuOpen(false)}
          >
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
            onClick={() => setIsMobileMenuOpen(false)}
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
            onClick={() => setIsMobileMenuOpen(false)}
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
            onClick={() => setIsMobileMenuOpen(false)}
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
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium">Gestión</span>
          </Link>

          <Link
            to="/receipts"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              isActive("/receipts") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-white/50"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Receipt className="w-5 h-5 mr-3" />
            <span className="font-medium">Recibos</span>
          </Link>

          {/* Reports Section */}
          <div className="mt-6 mb-4">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Informes
            </h3>
          </div>

          <Link
            to="/reports/children"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              isActive("/reports/children") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-white/50"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FileText className="w-5 h-5 mr-3" />
            <span className="font-medium">Listado de Niños</span>
          </Link>

          <Link
            to="/reports/sponsors"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              isActive("/reports/sponsors") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-white/50"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FileText className="w-5 h-5 mr-3" />
            <span className="font-medium">Listado de Padrinos</span>
          </Link>

          <Link
            to="/reports/schools"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              isActive("/reports/schools") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-white/50"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FileText className="w-5 h-5 mr-3" />
            <span className="font-medium">Listado de Colegios</span>
          </Link>

          <Link
            to="/reports/sponsorships"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              isActive("/reports/sponsorships") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-white/50"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <BarChart2 className="w-5 h-5 mr-3" />
            <span className="font-medium">Niños con Padrinos</span>
          </Link>

          <Link
            to="/configuration"
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              isActive("/configuration") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-white/50"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium">Configuración</span>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Navigation;