
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Child } from "@/types";

interface CompleteReportButtonProps {
  childrenWithoutSponsorship: Child[];
  childrenWithSponsorship: Child[];
  getSponsorName: (childId: string) => string;
}

export const CompleteReportButton = ({
  childrenWithoutSponsorship,
  childrenWithSponsorship,
  getSponsorName,
}: CompleteReportButtonProps) => {
  const { toast } = useToast();

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
    <Button onClick={handlePrintAllLists} variant="outline">
      <FileText className="h-4 w-4 mr-2" />
      Generar Reporte Completo
    </Button>
  );
};
