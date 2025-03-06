
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { School } from "@/types";

interface SchoolsTableProps {
  schools: School[];
}

export const SchoolsTable = ({ schools }: SchoolsTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Dirección</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map((school) => (
            <TableRow key={school.id}>
              <TableCell className="font-medium">{school.name}</TableCell>
              <TableCell>{school.address || "No disponible"}</TableCell>
            </TableRow>
          ))}
          {schools.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                No se encontraron colegios con los filtros seleccionados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
