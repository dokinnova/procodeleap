import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SponsorsFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  contributionFilter: string;
  onContributionFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const SponsorsFilter = ({
  search,
  onSearchChange,
  contributionFilter,
  onContributionFilterChange,
  statusFilter,
  onStatusFilterChange,
}: SponsorsFilterProps) => {
  const contributionRanges = [
    { label: "Menos de $50", min: 0, max: 50 },
    { label: "$50 - $100", min: 50, max: 100 },
    { label: "$100 - $200", min: 100, max: 200 },
    { label: "Más de $200", min: 200, max: Infinity },
  ];

  const statusOptions = [
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
    { value: "pending", label: "Pendiente" },
  ];

  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          className="pl-10 bg-white"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="w-[200px]">
        <Select value={contributionFilter} onValueChange={onContributionFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por contribución" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las contribuciones</SelectItem>
            {contributionRanges.map((range) => (
              <SelectItem key={range.label} value={range.label}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-[200px]">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};