
import { Baby, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { useQuery } from "@tanstack/react-query";
import { CHILDREN_QUERY_KEY } from "@/hooks/useChildrenData";

export const ChildrenHeader = () => {
  const { toast } = useToast();
  const { data: children = [] } = useQuery({
    queryKey: [CHILDREN_QUERY_KEY],
    enabled: false,
    initialData: [],
  });

  const handlePrint = () => {
    window.print();
    toast({
      title: "Preparando impresión",
      description: "Se abrirá el diálogo de impresión automáticamente.",
    });
  };

  const handleGeneratePdf = async () => {
    toast({
      title: "Generando PDF",
      description: "Espere mientras se genera el documento...",
    });

    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text("Listado de Niños Registrados", 105, 15, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 25, { align: 'center' });
      
      // Add table
      (doc as any).autoTable({
        head: [['Nombre', 'Edad', 'Ubicación', 'Escuela']],
        body: children.map(child => [
          child.name,
          `${child.age} años`,
          child.location,
          child.school_id || 'No asignada'
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
      doc.save(`listado-ninos-${new Date().toISOString().split('T')[0]}.pdf`);
      
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
    <div className="flex items-center justify-between print:hidden">
      <div className="flex items-center gap-3">
        <Baby className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Niños Registrados</h1>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleGeneratePdf} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Generar PDF
        </Button>
        <Button onClick={handlePrint} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Imprimir Listado
        </Button>
      </div>
    </div>
  );
};
