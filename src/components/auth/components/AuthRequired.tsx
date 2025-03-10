
import { AuthForm } from "../AuthForm";

export const AuthRequired = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">COPRODELI</h1>
          <p className="text-gray-600">Inicia sesión para continuar</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};
