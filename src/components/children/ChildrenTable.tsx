import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDeleteChild } from "@/hooks/useDeleteChild";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { Child } from "@/types";

interface ChildrenTableProps {
  children: Child[];
  search: string;
  setSearch: (search: string) => void;
  setSelectedChild: (child: Child) => void;
}

export const ChildrenTable = ({ children, search, setSearch, setSelectedChild }: ChildrenTableProps) => {
  const { childToDelete, setChildToDelete, handleDelete } = useDeleteChild();

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(search.toLowerCase())
  );

  // Función para generar un ID corto basado en el timestamp de creación y los primeros caracteres del UUID
  const generateShortId = (child: Child) => {
    const timestamp = new Date(child.created_at).getTime().toString(36);
    const uniqueId = child.id.slice(0, 4);
    return `${timestamp.slice(-4)}${uniqueId}`.toUpperCase();
  };

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
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChildren.map((child) => (
              <TableRow 
                key={child.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedChild(child)}
              >
                <TableCell className="font-mono text-sm">
                  {generateShortId(child)}
                </TableCell>
                <TableCell className="font-medium">{child.name}</TableCell>
                <TableCell>{child.age} años</TableCell>
                <TableCell>{child.location}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChildToDelete(child);
                    }}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredChildren.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No se encontraron niños
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        isOpen={!!childToDelete}
        onClose={() => setChildToDelete(null)}
        onConfirm={() => childToDelete && handleDelete(childToDelete.id)}
        title="¿Estás seguro?"
        description={`Esta acción no se puede deshacer. Se eliminará permanentemente el registro de ${childToDelete?.name}.`}
      />
    </div>
  );
};