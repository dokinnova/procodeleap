
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Sponsor } from "@/types";
import { Toast } from "@/components/ui/toast";

type ToastFunction = (props: any) => { id: string; dismiss: () => void; update: (props: any) => void };

export const generateSponsorsPdf = async (sponsors: Sponsor[], toast: ToastFunction) => {
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
    
    // Use autoTable directly
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
      startY: 35,
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
