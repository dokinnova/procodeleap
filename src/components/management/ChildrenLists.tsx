import { Child } from "@/types";
import { Separator } from "@/components/ui/separator";
import { ChildTable } from "./ChildTable";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

interface ChildrenListsProps {
  childrenWithoutSponsorship: Child[];
  childrenWithSponsorship: Child[];
  onChildSelect: (child: Child) => void;
  sponsorships: any[];
}

export const ChildrenLists = ({
  childrenWithoutSponsorship,
  childrenWithSponsorship,
  onChildSelect,
  sponsorships,
}: ChildrenListsProps) => {
  const { toast } = useToast();
  
  const getSponsorName = (childId: string) => {
    const sponsorship = sponsorships.find(s => s.child_id === childId);
    return sponsorship?.sponsor?.name || 'No disponible';
  };

  const handlePrintAllLists = async () => {
    toast({
      title: "Generando PDF completo",
      description: "Espere mientras se genera el documento...",
    });

    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text("Reporte Completo de Apadrinamientos", 105, 15, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 25, { align: 'center' });
      
      // Add section title - Niños sin Padrinos
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text("Niños sin Padrinos", 15, 35);
      doc.setTextColor(0);
      
      // Add table - Niños sin Padrinos
      (doc as any).autoTable({
        head: [['Nombre', 'Edad', 'Ubicación', 'Estado']],
        body: childrenWithoutSponsorship.map(child => [
          child.name,
          `${child.age} años`,
          child.location,
          'Pendiente'
        ]),
        startY: 40,
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Get the last position
      const finalY = (doc as any).previousAutoTable.finalY || 40;
      
      // Add section title - Niños con Padrinos
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text("Niños con Padrinos", 15, finalY + 15);
      doc.setTextColor(0);
      
      // Add table - Niños con Padrinos
      (doc as any).autoTable({
        head: [['Nombre', 'Edad', 'Ubicación', 'Padrino', 'Estado']],
        body: childrenWithSponsorship.map(child => [
          child.name,
          `${child.age} años`,
          child.location,
          getSponsorName(child.id),
          'Apadrinado'
        ]),
        startY: finalY + 20,
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
      doc.save(`listado-completo-ninos-${new Date().toISOString().split('T')[0]}.pdf`);
      
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
    <>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">Gestión de Apadrinamientos</h2>
        </div>
        <Button onClick={handlePrintAllLists} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Generar Reporte Completo
        </Button>
      </div>

      <ChildTable
        children={childrenWithoutSponsorship}
        title="Niños sin Padrinos"
        emptyMessage="No hay niños sin padrinos asignados"
        onChildSelect={onChildSelect}
        sponsorships={sponsorships}
      />

      <div className="relative py-8">
        <Separator className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2" />
        <div className="relative z-10 flex justify-center">
          <span className="px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
            Apadrinamientos Activos
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg border-2 border-primary">
        <ChildTable
          children={childrenWithSponsorship}
          title="Niños con Padrinos"
          emptyMessage="No hay niños con padrinos asignados"
          showSponsor={true}
          getSponsorName={getSponsorName}
          onChildSelect={onChildSelect}
          sponsorships={sponsorships}
        />
      </div>

      {/* Elemento oculto para impresión del listado completo */}
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
    </>
  );
};
