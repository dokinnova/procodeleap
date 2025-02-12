
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { useDeleteSponsor } from "@/hooks/useDeleteSponsor";
import { Sponsor } from "@/types";

interface SponsorsTableProps {
  sponsors: Sponsor[];
  search: string;
  onSearchChange: (value: string) => void;
  onSponsorSelect: (sponsor: Sponsor) => void;
}

export const SponsorsTable = ({ 
  sponsors, 
  search, 
  onSearchChange,
  onSponsorSelect 
}: SponsorsTableProps) => {
  const { sponsorToDelete, setSponsorToDelete, handleDelete } = useDeleteSponsor();

  const filteredSponsors = sponsors.filter(sponsor =>
    `${sponsor.first_name} ${sponsor.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (sponsor: Sponsor) => {
    onSponsorSelect(sponsor);
  };

  const handleDeleteClick = async (sponsor: Sponsor, e: React.MouseEvent) => {
    e.stopPropagation();
    setSponsorToDelete(sponsor);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          className="pl-10 bg-white"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contribución</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSponsors.map((sponsor) => (
              <TableRow 
                key={sponsor.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(sponsor)}
              >
                <TableCell className="font-medium">
                  {`${sponsor.first_name} ${sponsor.last_name}`}
                </TableCell>
                <TableCell>
                  {sponsor.email}
                </TableCell>
                <TableCell className="font-mono">
                  ${sponsor.contribution.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mes
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(sponsor.status)} variant="secondary">
                    {getStatusText(sponsor.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteClick(sponsor, e)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredSponsors.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No se encontraron padrinos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        isOpen={!!sponsorToDelete}
        onClose={() => setSponsorToDelete(null)}
        onConfirm={() => handleDelete(sponsorToDelete?.id || '')}
        title="¿Estás seguro?"
        description={`Esta acción no se puede deshacer. Se eliminará permanentemente el padrino ${sponsorToDelete ? `${sponsorToDelete.first_name} ${sponsorToDelete.last_name}` : ''}.`}
      />
    </div>
  );
};
