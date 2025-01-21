import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteChild } from "@/hooks/useDeleteChild";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { Child } from "@/types";
import { ChildrenFilters } from "./table/ChildrenFilters";
import { ChildStatusBadge } from "./table/ChildStatusBadge";
import { useToast } from "@/hooks/use-toast";

interface ChildrenTableProps {
  children: Child[];
  search: string;
  setSearch: (search: string) => void;
  setSelectedChild: (child: Child) => void;
}

export const ChildrenTable = ({ 
  children, 
  search, 
  setSearch, 
  setSelectedChild 
}: ChildrenTableProps) => {
  const { childToDelete, setChildToDelete, handleDelete } = useDeleteChild();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const generateShortId = (child: Child) => {
    const timestamp = new Date(child.created_at).getTime().toString(36);
    const uniqueId = child.id.slice(0, 4);
    return `${timestamp.slice(-4)}${uniqueId}`.toUpperCase();
  };

  const handleChildSelect = (child: Child) => {
    try {
      console.log('Seleccionando niño:', child);
      setSelectedChild(child);
      toast({
        title: "Niño seleccionado",
        description: `Se han cargado los datos de ${child.name}`,
      });
    } catch (error) {
      console.error('Error al seleccionar el niño:', error);
      toast({
        title: "Error",
        description: "No se pudo seleccionar el niño",
        variant: "destructive",
      });
    }
  };

  const filteredChildren = children.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "assigned" && child.status === "assigned") ||
                         (statusFilter === "assignable" && child.status === "assignable");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <ChildrenFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChildren.map((child) => (
              <TableRow 
                key={child.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleChildSelect(child)}
              >
                <TableCell className="font-mono text-sm">
                  {generateShortId(child)}
                </TableCell>
                <TableCell className="font-medium">{child.name}</TableCell>
                <TableCell>{child.age} años</TableCell>
                <TableCell>{child.location}</TableCell>
                <TableCell>
                  <ChildStatusBadge status={child.status} />
                </TableCell>
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
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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