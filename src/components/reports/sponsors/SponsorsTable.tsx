import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sponsor } from "@/types";
import { useNavigate } from "react-router-dom";

interface SponsorsTableProps {
  sponsors: Sponsor[];
}

export const SponsorsTable = ({ sponsors }: SponsorsTableProps) => {
  const navigate = useNavigate();

  const handleSponsorClick = (sponsor: Sponsor) => {
    console.log("Navegando a padrino:", sponsor);
    navigate(`/sponsors?selected=${sponsor.id}`);
  };

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
              <TableRow 
                key={sponsor.id}
                onClick={() => handleSponsorClick(sponsor)}
                className="cursor-pointer hover:bg-gray-50"
              >
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
                  {sponsor.status === 'active' ? 'Activo' : 
                   sponsor.status === 'inactive' ? 'Inactivo' : 
                   sponsor.status === 'pending' ? 'Pendiente' : sponsor.status}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};