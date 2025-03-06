
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Sponsor } from "@/types";
import { supabase } from "@/integrations/supabase/client";

type ToastFunction = (props: any) => { id: string; dismiss: () => void; update: (props: any) => void };

export const generateSponsorsPdf = async (sponsors: Sponsor[], toast: ToastFunction) => {
  toast({
    title: "Generando PDF",
    description: "Espere mientras se genera el documento...",
  });

  try {
    // Obtener la configuración del sitio para el logo
    const { data: siteSettings, error } = await supabase
      .from('site_settings')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error al obtener la configuración del sitio:', error);
    }
    
    const doc = new jsPDF();
    
    // Añadir banda gris en la parte superior (color más oscuro)
    doc.setFillColor(64, 62, 67); // Color gris más oscuro (#403E43)
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F'); // Aumentar la altura para incluir el título
    
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
      
      // Añadir nombre de Coprodeli junto al logo (color blanco)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255); // Color blanco
      doc.text('Coprodeli', 40, 20);
    } else {
      // Si no hay logo, solo añadir el nombre
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255); // Color blanco
      doc.text('Coprodeli', 15, 20);
    }
    
    // Añadir título dentro de la banda gris (color blanco)
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255); // Color blanco
    doc.text("Listado de Padrinos", 105, 28, { align: 'center' });
    
    // Añadir fecha (también en blanco dentro de la banda gris)
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255); // Color blanco
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 195, 18, { align: 'right' });
    
    // Restaurar color de texto a negro para el resto del documento
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    
    // Use autoTable directly (ajustado hacia abajo)
    autoTable(doc, {
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
      startY: 50, // Ajustar posición inicial para dar espacio
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
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

    return true;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    toast({
      title: "Error",
      description: "No se pudo generar el PDF",
      variant: "destructive",
    });
    return false;
  }
};
