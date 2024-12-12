import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sponsor } from "@/types";

interface AvailableSponsorsTableProps {
  sponsors: Sponsor[];
  onSponsorSelect: (sponsor: Sponsor) => void;
  isLoading: boolean;
}

export const AvailableSponsorsTable = ({ sponsors, onSponsorSelect, isLoading }: AvailableSponsorsTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Padrinos Disponibles</h2>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contribución</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : sponsors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No hay padrinos disponibles
                </TableCell>
              </TableRow>
            ) : (
              sponsors.map((sponsor) => (
                <TableRow 
                  key={sponsor.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onSponsorSelect(sponsor)}
                >
                  <TableCell>{sponsor.name}</TableCell>
                  <TableCell>{sponsor.email}</TableCell>
                  <TableCell className="font-mono">
                    ${sponsor.contribution.toLocaleString('en-US', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })}/mes
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};