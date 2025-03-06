
import { School } from "@/types";

interface SchoolsPrintableViewProps {
  schools: School[];
}

export const SchoolsPrintableView = ({ schools }: SchoolsPrintableViewProps) => {
  return (
    <div id="schools-report-printable" className="hidden">
      <div className="p-8 max-w-[210mm] mx-auto bg-white">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listado de Colegios</h1>
          <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-2 text-left font-bold">Nombre</th>
              <th className="py-2 text-left font-bold">Dirección</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id} className="border-b border-gray-300">
                <td className="py-2">{school.name}</td>
                <td className="py-2">{school.address || "No disponible"}</td>
              </tr>
            ))}
            {schools.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center py-8 text-gray-500">
                  No se encontraron colegios con los filtros seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="mt-8 text-xs text-gray-400 text-right">
          <p>Documento generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}</p>
        </div>
      </div>
    </div>
  );
};
