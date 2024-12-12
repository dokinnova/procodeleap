import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { School } from "@/pages/Schools";
import { SchoolSearchBar } from "./SchoolSearchBar";
import { DeleteSchoolDialog } from "./DeleteSchoolDialog";
import { useDeleteSchool } from "@/hooks/useDeleteSchool";

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
  const { schoolToDelete, setSchoolToDelete, handleDelete } = useDeleteSchool();

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <SchoolSearchBar search={search} setSearch={setSearch} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSchoolToDelete(school);
                    }}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredSchools.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No se encontraron colegios
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteSchoolDialog
        school={schoolToDelete}
        onOpenChange={() => setSchoolToDelete(null)}
        onConfirmDelete={handleDelete}
      />
    </div>
  );
};