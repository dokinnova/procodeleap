
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SchoolsSearchFilterProps {
  search: string;
  setSearch: (value: string) => void;
}

export const SchoolsSearchFilter = ({ search, setSearch }: SchoolsSearchFilterProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        className="pl-10 bg-white"
        placeholder="Buscar por nombre o dirección..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};
