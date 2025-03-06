
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskFiltersProps {
  filter: 'all' | 'pending' | 'completed';
  setFilter: (filter: 'all' | 'pending' | 'completed') => void;
}

export const TaskFilters = ({ filter, setFilter }: TaskFiltersProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Estado</h4>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="filter-all" 
                  checked={filter === 'all'} 
                  onCheckedChange={() => setFilter('all')}
                />
                <label htmlFor="filter-all">Todas</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="filter-pending" 
                  checked={filter === 'pending'} 
                  onCheckedChange={() => setFilter('pending')}
                />
                <label htmlFor="filter-pending">Pendientes</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="filter-completed" 
                  checked={filter === 'completed'} 
                  onCheckedChange={() => setFilter('completed')}
                />
                <label htmlFor="filter-completed">Completadas</label>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
