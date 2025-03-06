
import { useQuery } from "@tanstack/react-query";
import { FileText, Printer, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import generatePdf from "react-to-pdf";

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

    const options = {
      filename: `listado-colegios-${new Date().toISOString().split('T')[0]}.pdf`,
      page: {
        margin: 20,
        format: 'a4',
      },
      overrides: {
        pdf: {
          compress: true
        },
        canvas: {
          useCORS: true
        }
      }
    };

    try {
      const targetElement = document.getElementById('schools-report-printable');
      if (targetElement) {
        await generatePdf(() => targetElement, options);
        toast({
          title: "PDF generado correctamente",
          description: "El documento se ha descargado",
          variant: "default",
        });
      }
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
          <Printer className="h-4 w-4 mr-2" />
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
