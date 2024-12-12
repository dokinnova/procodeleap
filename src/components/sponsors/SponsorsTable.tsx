import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const filteredSponsors = sponsors.filter(sponsor =>
    sponsor.name.toLowerCase().includes(search.toLowerCase())
  );

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSponsors.map((sponsor) => (
              <TableRow 
                key={sponsor.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSponsorSelect(sponsor)}
              >
                <TableCell className="font-medium">{sponsor.name}</TableCell>
                <TableCell>{sponsor.email}</TableCell>
                <TableCell>${sponsor.contribution}/mes</TableCell>
              </TableRow>
            ))}
            {filteredSponsors.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No se encontraron padrinos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};