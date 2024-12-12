import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { School } from "@/pages/Schools";

interface SchoolsTableProps {
  schools: School[];
  search: string;
  setSearch: (search: string) => void;
  onSelectSchool: (school: School) => void;
}

export const SchoolsTable = ({
  schools,
  search,
  setSearch,
  onSelectSchool,
}: SchoolsTableProps) => {
  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          className="pl-10 bg-white"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
              <TableRow 
                key={school.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectSchool(school)}
              >
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell>{school.address || "No disponible"}</TableCell>
              </TableRow>
            ))}
            {filteredSchools.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                  No se encontraron colegios
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};