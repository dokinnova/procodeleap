import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            PROCODELI
          </Link>
          <div className="flex space-x-8">
            <Link
              to="/children"
              className={`transition-colors hover:text-primary ${
                isActive("/children") ? "text-primary font-semibold" : "text-gray-600"
              }`}
            >
              Niños
            </Link>
            <Link
              to="/sponsors"
              className={`transition-colors hover:text-primary ${
                isActive("/sponsors") ? "text-primary font-semibold" : "text-gray-600"
              }`}
            >
              Padrinos
            </Link>
            <Link
              to="/management"
              className={`transition-colors hover:text-primary ${
                isActive("/management") ? "text-primary font-semibold" : "text-gray-600"
              }`}
            >
              Gestión
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;