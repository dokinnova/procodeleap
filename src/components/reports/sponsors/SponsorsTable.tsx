import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sponsor } from "@/types";

interface SponsorsTableProps {
  sponsors: Sponsor[];
  statusOptions: { value: string; label: string; }[];
}

export const SponsorsTable = ({ sponsors, statusOptions }: SponsorsTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Contribución</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sponsors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No se encontraron padrinos
              </TableCell>
            </TableRow>
          ) : (
            sponsors.map((sponsor) => (
              <TableRow key={sponsor.id}>
                <TableCell className="font-medium">{sponsor.name}</TableCell>
                <TableCell>{sponsor.email}</TableCell>
                <TableCell>{sponsor.phone || "No disponible"}</TableCell>
                <TableCell className="font-mono">
                  ${sponsor.contribution.toLocaleString("es-ES", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  /mes
                </TableCell>
                <TableCell>
                  {statusOptions.find(opt => opt.value === sponsor.status)?.label || sponsor.status}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};