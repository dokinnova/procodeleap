
import { Child } from "@/types";

interface AllChildrenPrintableViewProps {
  childrenWithoutSponsorship: Child[];
  childrenWithSponsorship: Child[];
  getSponsorName: (childId: string) => string;
}

export const AllChildrenPrintableView = ({
  childrenWithoutSponsorship,
  childrenWithSponsorship,
  getSponsorName,
}: AllChildrenPrintableViewProps) => {
  return (
    <div id="all-children-printable" className="hidden">
      <div className="p-8 max-w-[210mm] mx-auto bg-white">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reporte Completo de Apadrinamientos</h1>
          <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
        </div>
        
        <h2 className="text-xl font-bold mb-4 text-primary">Niños sin Padrinos</h2>
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-2 text-left font-bold">Nombre</th>
              <th className="py-2 text-left font-bold">Edad</th>
              <th className="py-2 text-left font-bold">Ubicación</th>
              <th className="py-2 text-left font-bold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {childrenWithoutSponsorship.map((child) => (
              <tr key={child.id} className="border-b border-gray-300">
                <td className="py-2">{child.name}</td>
                <td className="py-2">{child.age} años</td>
                <td className="py-2">{child.location}</td>
                <td className="py-2">Pendiente</td>
              </tr>
            ))}
            {childrenWithoutSponsorship.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No hay niños sin padrinos asignados
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <h2 className="text-xl font-bold mb-4 text-primary">Niños con Padrinos</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-2 text-left font-bold">Nombre</th>
              <th className="py-2 text-left font-bold">Edad</th>
              <th className="py-2 text-left font-bold">Ubicación</th>
              <th className="py-2 text-left font-bold">Padrino</th>
              <th className="py-2 text-left font-bold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {childrenWithSponsorship.map((child) => (
              <tr key={child.id} className="border-b border-gray-300">
                <td className="py-2">{child.name}</td>
                <td className="py-2">{child.age} años</td>
                <td className="py-2">{child.location}</td>
                <td className="py-2">{getSponsorName(child.id)}</td>
                <td className="py-2">Apadrinado</td>
              </tr>
            ))}
            {childrenWithSponsorship.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No hay niños con padrinos asignados
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
