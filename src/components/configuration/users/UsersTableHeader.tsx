
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const UsersTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Email</TableHead>
        <TableHead>Rol</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Última autenticación</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};
