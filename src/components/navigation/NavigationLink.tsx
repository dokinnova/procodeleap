import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavigationLinkProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
}

export const NavigationLink = ({ to, icon: Icon, children, onClick }: NavigationLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-gray-600 hover:bg-white/50"
      }`}
      onClick={onClick}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="font-medium">{children}</span>
    </Link>
  );
};