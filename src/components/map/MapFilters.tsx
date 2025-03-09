
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MapFiltersProps {
  selectedTab: "all" | "children" | "sponsors";
  showChildren: boolean;
  showSponsors: boolean;
  onTabChange: (value: string) => void;
  onChildrenToggle: (checked: boolean) => void;
  onSponsorsToggle: (checked: boolean) => void;
}

export const MapFilters = ({
  selectedTab,
  showChildren,
  showSponsors,
  onTabChange,
  onChildrenToggle,
  onSponsorsToggle,
}: MapFiltersProps) => {
  return (
    <>
      <div className="mb-4">
        <Tabs defaultValue={selectedTab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="children">Niños</TabsTrigger>
            <TabsTrigger value="sponsors">Padrinos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex items-center gap-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-children" 
            checked={showChildren}
            onCheckedChange={onChildrenToggle}
          />
          <Label htmlFor="show-children" className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-violet-600"></span>
            Niños
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-sponsors"
            checked={showSponsors}
            onCheckedChange={onSponsorsToggle}
          />
          <Label htmlFor="show-sponsors" className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            Padrinos
          </Label>
        </div>
      </div>
    </>
  );
};
