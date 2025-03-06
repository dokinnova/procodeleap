
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Child } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const generateChildrenReportPdf = async (children: Child[]) => {
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
      
      // Añadir nombre de Coprodeli junto al logo (color blanco)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255); // Color blanco
      doc.text('Coprodeli', 40, 20);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0); // Restaurar color de texto a negro para el resto del documento
    } else {
      // Si no hay logo, solo añadir el nombre
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255); // Color blanco
      doc.text('Coprodeli', 15, 20);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0); // Restaurar color de texto a negro para el resto del documento
    }
    
    // Add title (ajustado hacia abajo para dar espacio al logo)
    doc.setFontSize(18);
    doc.text("Reporte de Niños", 105, 35, { align: 'center' });
    
    // Add date (ajustado hacia abajo)
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 105, 45, { align: 'center' });
    
    // Add table using autoTable directly (ajustado hacia abajo)
    autoTable(doc, {
      head: [['ID', 'Nombre', 'Edad', 'Ubicación', 'Escuela']],
      body: children.map(child => [
        child.id.substring(0, 8), // Mostrar solo los primeros 8 caracteres del ID
        child.name,
        `${child.age} años`,
        child.location,
        child.schools?.name || 'No asignada'
      ]),
      startY: 55,
      styles: { fontSize: 8, cellPadding: 4 }, // Reducir tamaño de fuente y padding
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 9 }, // Encabezado un poco más grande
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
    doc.save(`reporte-ninos-${new Date().toISOString().split('T')[0]}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return false;
  }
};
