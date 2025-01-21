import { Child } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PrintableChildProfile } from "../children/PrintableChildProfile";
import { generatePDF } from "react-to-pdf";

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
  const getSponsorName = (childId: string) => {
    const sponsorship = sponsorships.find(s => s.child_id === childId);
    return sponsorship?.sponsor?.name || 'No disponible';
  };

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
        await generatePDF(() => targetElement, options);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const renderChildrenTable = (childrenList: Child[], title: string, emptyMessage: string, showSponsor: boolean = false) => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
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
            {childrenList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showSponsor ? 6 : 5} className="text-center py-8 text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              childrenList.map((child) => (
                <TableRow 
                  key={child.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell onClick={() => onChildSelect(child)}>{child.name}</TableCell>
                  <TableCell onClick={() => onChildSelect(child)}>{child.age} años</TableCell>
                  <TableCell onClick={() => onChildSelect(child)}>{child.location}</TableCell>
                  {showSponsor && <TableCell onClick={() => onChildSelect(child)}>{getSponsorName(child.id)}</TableCell>}
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
    </div>
  );

  return (
    <>
      {renderChildrenTable(
        childrenWithoutSponsorship,
        "Niños sin Padrinos",
        "No hay niños sin padrinos asignados"
      )}

      <div className="relative py-8">
        <Separator className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2" />
        <div className="relative z-10 flex justify-center">
          <span className="px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
            Apadrinamientos Activos
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg border-2 border-primary">
        {renderChildrenTable(
          childrenWithSponsorship,
          "Niños con Padrinos",
          "No hay niños con padrinos asignados",
          true
        )}
      </div>
    </>
  );
};