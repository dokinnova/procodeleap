
import { Users, UserPlus, Settings, School, Receipt, Menu, X, Mail, PieChart, ClipboardList } from "lucide-react";
import { Button } from "./ui/button";
import { NavigationLink } from "./navigation/NavigationLink";
import { NavigationHeader } from "./navigation/NavigationHeader";
import { NavigationReports } from "./navigation/NavigationReports";

interface NavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Navigation = ({ isMobileMenuOpen, setIsMobileMenuOpen }: NavigationProps) => {
  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
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

      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#F1F0FB] shadow-sm transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <NavigationHeader onLogoClick={handleLinkClick} />

        <nav className="mt-6 px-3">
          <NavigationLink to="/children" icon={Users} onClick={handleLinkClick}>
            Niños
          </NavigationLink>

          <NavigationLink to="/sponsors" icon={UserPlus} onClick={handleLinkClick}>
            Padrinos
          </NavigationLink>

          <NavigationLink to="/schools" icon={School} onClick={handleLinkClick}>
            Colegios
          </NavigationLink>

          <NavigationLink to="/management" icon={Settings} onClick={handleLinkClick}>
            Gestión
          </NavigationLink>

          <NavigationLink to="/receipts" icon={Receipt} onClick={handleLinkClick}>
            Recibos
          </NavigationLink>

          <NavigationLink to="/tasks" icon={ClipboardList} onClick={handleLinkClick}>
            Tareas
          </NavigationLink>

          <NavigationLink to="/crm" icon={Mail} onClick={handleLinkClick}>
            CRM
          </NavigationLink>
          
          <NavigationLink to="/business-intelligence" icon={PieChart} onClick={handleLinkClick}>
            Business Intelligence
          </NavigationLink>

          <NavigationReports onLinkClick={handleLinkClick} />

          <NavigationLink to="/configuration" icon={Settings} onClick={handleLinkClick}>
            Configuración
          </NavigationLink>
        </nav>
      </div>
    </>
  );
};

export default Navigation;
