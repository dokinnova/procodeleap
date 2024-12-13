import { FileText, BarChart2 } from "lucide-react";
import { NavigationLink } from "./NavigationLink";

interface NavigationReportsProps {
  onLinkClick?: () => void;
}

export const NavigationReports = ({ onLinkClick }: NavigationReportsProps) => {
  return (
    <>
      <div className="mt-6 mb-4">
        <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Informes
        </h3>
      </div>

      <NavigationLink to="/reports/children" icon={FileText} onClick={onLinkClick}>
        Listado de Niños
      </NavigationLink>

      <NavigationLink to="/reports/sponsors" icon={FileText} onClick={onLinkClick}>
        Listado de Padrinos
      </NavigationLink>

      <NavigationLink to="/reports/schools" icon={FileText} onClick={onLinkClick}>
        Listado de Colegios
      </NavigationLink>

      <NavigationLink to="/reports/sponsorships" icon={BarChart2} onClick={onLinkClick}>
        Niños con Padrinos
      </NavigationLink>
    </>
  );
};