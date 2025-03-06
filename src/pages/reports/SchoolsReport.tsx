
import { useQuery } from "@tanstack/react-query";
import { FileText, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const SchoolsReport = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ["schools-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(search.toLowerCase()) ||
    (school.address && school.address.toLowerCase().includes(search.toLowerCase()))
  );

  const handlePrint = async () => {
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
      doc.text("Listado de Colegios", 105, 28, { align: 'center' });
      
      // Añadir fecha (también en blanco dentro de la banda gris)
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255); // Color blanco
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 195, 18, { align: 'right' });
      
      // Restaurar color de texto a negro para el resto del documento
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
      
      // Use autoTable directly
      autoTable(doc, {
        head: [['Nombre', 'Dirección']],
        body: filteredSchools.map(school => [
          school.name,
          school.address || "No disponible"
        ]),
        startY: 50, // Ajustar posición inicial para dar espacio a la banda gris
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
      doc.save(`listado-colegios-${new Date().toISOString().split('T')[0]}.pdf`);
      
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-lg text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Listado de Colegios</h1>
        </div>
        <Button onClick={handlePrint} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Generar PDF
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          className="pl-10 bg-white"
          placeholder="Buscar por nombre o dirección..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla visible en la interfaz */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchools.map((school) => (
              <TableRow key={school.id}>
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell>{school.address || "No disponible"}</TableCell>
              </TableRow>
            ))}
            {filteredSchools.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                  No se encontraron colegios con los filtros seleccionados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Elemento oculto para impresión */}
      <div id="schools-report-printable" className="hidden">
        <div className="p-8 max-w-[210mm] mx-auto bg-white">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Listado de Colegios</h1>
            <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
          </div>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="py-2 text-left font-bold">Nombre</th>
                <th className="py-2 text-left font-bold">Dirección</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map((school) => (
                <tr key={school.id} className="border-b border-gray-300">
                  <td className="py-2">{school.name}</td>
                  <td className="py-2">{school.address || "No disponible"}</td>
                </tr>
              ))}
              {filteredSchools.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center py-8 text-gray-500">
                    No se encontraron colegios con los filtros seleccionados
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

export default SchoolsReport;
