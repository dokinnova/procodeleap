import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SchoolSearchBarProps {
  search: string;
  setSearch: (search: string) => void;
}

export const SchoolSearchBar = ({ search, setSearch }: SchoolSearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        className="pl-10 bg-white"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};