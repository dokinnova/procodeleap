interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer = ({ children }: AuthContainerProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-grow flex items-center justify-center">
        {children}
      </div>
      <footer className="text-center py-4 text-sm text-gray-500">
        Desarrollado por Adapta © {currentYear}
      </footer>
    </div>
  );
};