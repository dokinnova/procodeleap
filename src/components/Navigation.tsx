import { Link, useLocation } from "react-router-dom";
import { Users, UserPlus, Settings } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-800">
          <Link to="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            PROCODELI
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
            to="/management"
            className={`flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${
              isActive("/management") ? "bg-gray-800 border-l-4 border-primary" : ""
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span>Gestión</span>
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Sistema de Gestión PROCODELI
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Navigation;