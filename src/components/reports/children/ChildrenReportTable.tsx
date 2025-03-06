
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Child } from "@/types";
import { useNavigate } from "react-router-dom";

interface ChildrenReportTableProps {
  filteredChildren: Child[];
}

export const ChildrenReportTable = ({ filteredChildren }: ChildrenReportTableProps) => {
  const navigate = useNavigate();

  const handleChildClick = (child: Child) => {
    console.log('Navegando a detalles del niño:', child.id);
    navigate('/children', { state: { selectedChild: child } });
  };

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Edad
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ubicación
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Escuela
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {filteredChildren.map((child) => (
            <TableRow 
              key={child.id}
              onClick={() => handleChildClick(child)}
              className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            >
              <TableCell className="px-6 py-4 whitespace-nowrap">{child.name}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">{child.age} años</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">{child.location}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {child.schools?.name || 'No asignada'}
              </TableCell>
            </TableRow>
          ))}
          {filteredChildren.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="px-6 py-4 text-center text-gray-500">
                No se encontraron niños
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
