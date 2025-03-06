
import { Sponsor } from "@/types";
import { SponsorsExportButton } from "./SponsorsExportButton";
import { SponsorsTableContent } from "./SponsorsTableContent";

interface SponsorsTableProps {
  sponsors: Sponsor[];
}

export const SponsorsTable = ({ sponsors }: SponsorsTableProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <SponsorsExportButton sponsors={sponsors} />
      </div>
    
      <SponsorsTableContent sponsors={sponsors} />

      {/* Elemento oculto para impresión - kept for backward compatibility */}
      <div id="sponsors-report-printable" className="hidden">
        <div className="p-8 max-w-[210mm] mx-auto bg-white">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Listado de Padrinos</h1>
            <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
          </div>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="py-2 text-left font-bold">Nombre</th>
                <th className="py-2 text-left font-bold">Email</th>
                <th className="py-2 text-left font-bold">Teléfono</th>
                <th className="py-2 text-left font-bold">Contribución</th>
                <th className="py-2 text-left font-bold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((sponsor) => (
                <tr key={sponsor.id} className="border-b border-gray-300">
                  <td className="py-2">{`${sponsor.first_name} ${sponsor.last_name}`}</td>
                  <td className="py-2">{sponsor.email}</td>
                  <td className="py-2">{sponsor.phone || "No disponible"}</td>
                  <td className="py-2 font-mono">
                    ${sponsor.contribution.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}/mes
                  </td>
                  <td className="py-2">
                    {sponsor.status === 'active' ? 'Activo' : 
                    sponsor.status === 'inactive' ? 'Inactivo' : 
                    sponsor.status === 'pending' ? 'Pendiente' : sponsor.status}
                  </td>
                </tr>
              ))}
              {sponsors.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No se encontraron padrinos
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
    </div>
  );
};
