
import { Child } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PrintableChildProfile } from "../children/PrintableChildProfile";
import generatePdf from "react-to-pdf";
import { useToast } from "@/hooks/use-toast";

interface ChildTableProps {
  children: Child[];
  title: string;
  emptyMessage: string;
  showSponsor?: boolean;
  onChildSelect: (child: Child) => void;
  getSponsorName?: (childId: string) => string;
  sponsorships: any[];
}

export const ChildTable = ({
  children,
  title,
  emptyMessage,
  showSponsor = false,
  onChildSelect,
  getSponsorName,
  sponsorships,
}: ChildTableProps) => {
  const { toast } = useToast();

  const handlePrintProfile = async (child: Child) => {
    const options = {
      filename: `ficha-${child.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      page: {
        margin: 20,
        format: 'a4',
      },
    };

    try {
      const targetElement = document.getElementById(`printable-profile-${child.id}`);
      if (targetElement) {
        await generatePdf(() => targetElement, options);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrintTable = async () => {
    toast({
      title: "Generando PDF",
      description: "Espere mientras se genera el documento...",
    });

    const options = {
      filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
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
      const targetElement = document.getElementById(`table-printable-${title.replace(/\s+/g, '-')}`);
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <Button onClick={handlePrintTable} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Generar PDF
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Ubicación</TableHead>
              {showSponsor && <TableHead>Padrino</TableHead>}
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showSponsor ? 6 : 5} className="text-center py-8 text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              children.map((child) => (
                <TableRow 
                  key={child.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell onClick={() => onChildSelect(child)}>{child.name}</TableCell>
                  <TableCell onClick={() => onChildSelect(child)}>{child.age} años</TableCell>
                  <TableCell onClick={() => onChildSelect(child)}>{child.location}</TableCell>
                  {showSponsor && <TableCell onClick={() => onChildSelect(child)}>{getSponsorName?.(child.id)}</TableCell>}
                  <TableCell onClick={() => onChildSelect(child)}>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sponsorships.some(s => s.child_id === child.id)
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {sponsorships.some(s => s.child_id === child.id)
                        ? "Apadrinado"
                        : "Pendiente"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <div id={`printable-profile-${child.id}`}>
                          <PrintableChildProfile child={child} />
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button onClick={() => handlePrintProfile(child)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Generar PDF
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Elemento oculto para impresión */}
      <div id={`table-printable-${title.replace(/\s+/g, '-')}`} className="hidden">
        <div className="p-8 max-w-[210mm] mx-auto bg-white">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
          </div>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="py-2 text-left font-bold">Nombre</th>
                <th className="py-2 text-left font-bold">Edad</th>
                <th className="py-2 text-left font-bold">Ubicación</th>
                {showSponsor && <th className="py-2 text-left font-bold">Padrino</th>}
                <th className="py-2 text-left font-bold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {children.map((child) => (
                <tr key={child.id} className="border-b border-gray-300">
                  <td className="py-2">{child.name}</td>
                  <td className="py-2">{child.age} años</td>
                  <td className="py-2">{child.location}</td>
                  {showSponsor && <td className="py-2">{getSponsorName?.(child.id)}</td>}
                  <td className="py-2">
                    {sponsorships.some(s => s.child_id === child.id)
                      ? "Apadrinado"
                      : "Pendiente"}
                  </td>
                </tr>
              ))}
              {children.length === 0 && (
                <tr>
                  <td colSpan={showSponsor ? 5 : 4} className="text-center py-8 text-gray-500">
                    {emptyMessage}
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
