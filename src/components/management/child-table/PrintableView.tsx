
import { Child } from "@/types";

interface PrintableViewProps {
  title: string;
  children: Child[];
  emptyMessage: string;
  showSponsor?: boolean;
  getSponsorName?: (childId: string) => string;
  sponsorships: any[];
}

export const PrintableView = ({
  title,
  children,
  emptyMessage,
  showSponsor = false,
  getSponsorName,
  sponsorships
}: PrintableViewProps) => {
  return (
    <div className="hidden">
      <div className="p-8 max-w-[210mm] mx-auto bg-white">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-2 text-left font-bold">Nombre</th>
              <th className="py-2 text-left font-bold">Edad</th>
              <th className="py-2 text-left font-bold">Ubicación</th>
              {showSponsor && <th className="py-2 text-left font-bold">Padrino</th>}
              <th className="py-2 text-left font-bold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {children.map((child) => (
              <tr key={child.id} className="border-b border-gray-300">
                <td className="py-2">{child.name}</td>
                <td className="py-2">{child.age} años</td>
                <td className="py-2">{child.location}</td>
                {showSponsor && <td className="py-2">{getSponsorName?.(child.id)}</td>}
                <td className="py-2">
                  {sponsorships.some(s => s.child_id === child.id)
                    ? "Apadrinado"
                    : "Pendiente"}
                </td>
              </tr>
            ))}
            {children.length === 0 && (
              <tr>
                <td colSpan={showSponsor ? 5 : 4} className="text-center py-8 text-gray-500">
                  {emptyMessage}
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
