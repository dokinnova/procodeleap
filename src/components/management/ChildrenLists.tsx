
import { Child } from "@/types";
import { Separator } from "@/components/ui/separator";
import { ChildTable } from "./ChildTable";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import generatePdf from "react-to-pdf";

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

    const options = {
      filename: `listado-completo-ninos-${new Date().toISOString().split('T')[0]}.pdf`,
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
      const targetElement = document.getElementById('all-children-printable');
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

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">Gestión de Apadrinamientos</h2>
        </div>
        <Button onClick={handlePrintAllLists} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
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
