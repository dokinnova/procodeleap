
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sponsor } from "@/types";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

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

    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text("Listado de Padrinos", 105, 15, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 25, { align: 'center' });
      
      // Add table
      (doc as any).autoTable({
        head: [['Nombre', 'Email', 'Teléfono', 'Contribución', 'Estado']],
        body: sponsors.map(sponsor => [
          `${sponsor.first_name} ${sponsor.last_name}`,
          sponsor.email,
          sponsor.phone || "No disponible",
          `$${sponsor.contribution.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}/mes`,
          sponsor.status === 'active' ? 'Activo' : 
          sponsor.status === 'inactive' ? 'Inactivo' : 
          sponsor.status === 'pending' ? 'Pendiente' : sponsor.status
        ]),
        startY: 35,
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Add footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const footer = `Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(footer, 195, 285, { align: 'right' });
      }
      
      // Save the PDF
      doc.save(`listado-padrinos-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF generado correctamente",
        description: "El documento se ha descargado",
        variant: "default",
      });
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
          <FileText className="h-4 w-4 mr-2" />
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
