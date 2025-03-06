
import { Child } from "@/types";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

interface PrintableChildrenListProps {
  children: Child[];
}

export const PrintableChildrenList = ({ children }: PrintableChildrenListProps) => {
  // This component won't render anything visible
  // It will be used via its printAsPdf method
  
  const printAsPdf = () => {
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
      
      return true;
    } catch (error) {
      console.error('Error al generar PDF:', error);
      return false;
    }
  };

  // Expose the printAsPdf method to the window object so it can be called from outside
  // @ts-ignore
  window.printChildrenListAsPdf = printAsPdf;

  // Nothing to render
  return null;
};
