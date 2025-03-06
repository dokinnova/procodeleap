
import { Child } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { PrintableChildProfile } from "@/components/children/PrintableChildProfile";

interface TableContentProps {
  children: Child[];
  title: string;
  emptyMessage: string;
  showSponsor?: boolean;
  onChildSelect: (child: Child) => void;
  getSponsorName?: (childId: string) => string;
  sponsorships: any[];
  onPrintProfile: (child: Child) => void;
}

export const TableContent = ({
  children,
  title,
  emptyMessage,
  showSponsor = false,
  onChildSelect,
  getSponsorName,
  sponsorships,
  onPrintProfile
}: TableContentProps) => {
  return (
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
                        <Button onClick={() => onPrintProfile(child)}>
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
  );
};
