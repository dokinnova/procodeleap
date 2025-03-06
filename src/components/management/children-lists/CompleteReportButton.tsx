
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Child } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Obtener el logo y la configuración del sitio
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handlePrintAllLists = async () => {
    toast({
      title: "Generando PDF completo",
      description: "Espere mientras se genera el documento...",
    });

    try {
      const doc = new jsPDF();
      
      // Añadir banda gris en la parte superior
      doc.setFillColor(240, 240, 240); // Color gris claro
      doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');
      
      // Añadir logo y nombre de Coprodeli
      if (siteSettings?.logo_url) {
        // Convertir la URL del logo a una imagen y añadirla al PDF
        const img = new Image();
        img.src = siteSettings.logo_url;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        // Añadir logo en la esquina superior izquierda
        doc.addImage(img, 'PNG', 15, 10, 20, 20);
        
        // Añadir nombre de Coprodeli junto al logo
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Coprodeli', 40, 20);
        doc.setFont('helvetica', 'normal');
      } else {
        // Si no hay logo, solo añadir el nombre
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Coprodeli', 15, 20);
        doc.setFont('helvetica', 'normal');
      }
      
      // Add title (ahora centrado horizontalmente pero bajado un poco para dar espacio al logo)
      doc.setFontSize(18);
      doc.text("Reporte Completo de Apadrinamientos", 105, 35, { align: 'center' });
      
      // Add date (bajado también)
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 45, { align: 'center' });
      
      // Add section title - Niños sin Padrinos (ajustado hacia abajo)
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text("Niños sin Padrinos", 15, 55);
      doc.setTextColor(0);
      
      // Add table - Niños sin Padrinos (ajustado hacia abajo)
      (doc as any).autoTable({
        head: [['Nombre', 'Edad', 'Ubicación', 'Estado']],
        body: childrenWithoutSponsorship.map(child => [
          child.name,
          `${child.age} años`,
          child.location,
          'Pendiente'
        ]),
        startY: 60,
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Get the last position
      const finalY = (doc as any).previousAutoTable.finalY || 60;
      
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
