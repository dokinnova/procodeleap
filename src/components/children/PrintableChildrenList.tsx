
import { Child } from "@/types";

interface PrintableChildrenListProps {
  children: Child[];
}

export const PrintableChildrenList = ({ children }: PrintableChildrenListProps) => {
  return (
    <div className="hidden print:block print:p-8 print:max-w-[210mm] print:mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Listado de Niños Registrados</h1>
        <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="py-2 text-left font-bold">Nombre</th>
            <th className="py-2 text-left font-bold">Edad</th>
            <th className="py-2 text-left font-bold">Ubicación</th>
            <th className="py-2 text-left font-bold">Escuela</th>
          </tr>
        </thead>
        <tbody>
          {children.map((child) => (
            <tr key={child.id} className="border-b border-gray-300">
              <td className="py-2">{child.name}</td>
              <td className="py-2">{child.age} años</td>
              <td className="py-2">{child.location}</td>
              <td className="py-2">{child.school_id || 'No asignada'}</td>
            </tr>
          ))}
          {children.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-500">
                No hay niños registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div className="mt-8 text-xs text-gray-400 text-right">
        <p>Documento generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}</p>
      </div>
    </div>
  );
};
