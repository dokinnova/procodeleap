
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sponsor } from "@/types";
import { useNavigate } from "react-router-dom";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import generatePdf from "react-to-pdf";

interface SponsorsTableProps {
  sponsors: Sponsor[];
}

export const SponsorsTable = ({ sponsors }: SponsorsTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSponsorClick = (sponsor: Sponsor) => {
    console.log("Navegando a padrino:", sponsor);
    navigate(`/sponsors?selected=${sponsor.id}`);
  };

  const handlePrintSponsors = async () => {
    toast({
      title: "Generando PDF",
      description: "Espere mientras se genera el documento...",
    });

    const options = {
      filename: `listado-padrinos-${new Date().toISOString().split('T')[0]}.pdf`,
      page: {
        margin: 20,
        format: 'a4',
      },
      overrides: {
        pdf: {
          compress: true
        },
        canvas: {
          useCORS: true
        }
      }
    };

    try {
      const targetElement = document.getElementById('sponsors-report-printable');
      if (targetElement) {
        await generatePdf(() => targetElement, options);
        toast({
          title: "PDF generado correctamente",
          description: "El documento se ha descargado",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handlePrintSponsors} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Generar PDF
        </Button>
      </div>
    
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Contribución</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sponsors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No se encontraron padrinos
                </TableCell>
              </TableRow>
            ) : (
              sponsors.map((sponsor) => (
                <TableRow 
                  key={sponsor.id}
                  onClick={() => handleSponsorClick(sponsor)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell className="font-medium">{`${sponsor.first_name} ${sponsor.last_name}`}</TableCell>
                  <TableCell>{sponsor.email}</TableCell>
                  <TableCell>{sponsor.phone || "No disponible"}</TableCell>
                  <TableCell className="font-mono">
                    ${sponsor.contribution.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    /mes
                  </TableCell>
                  <TableCell>
                    {sponsor.status === 'active' ? 'Activo' : 
                    sponsor.status === 'inactive' ? 'Inactivo' : 
                    sponsor.status === 'pending' ? 'Pendiente' : sponsor.status}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Elemento oculto para impresión */}
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
