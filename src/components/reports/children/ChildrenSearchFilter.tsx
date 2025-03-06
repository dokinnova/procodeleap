
import { Input } from "@/components/ui/input";

interface ChildrenSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const ChildrenSearchFilter = ({ 
  searchTerm, 
  setSearchTerm 
}: ChildrenSearchFilterProps) => {
  return (
    <Input
      type="text"
      placeholder="Buscar por nombre..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full p-2 border rounded"
    />
  );
};
