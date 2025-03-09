
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMapData } from "@/hooks/useMapData";
import { MapFilters } from "@/components/map/MapFilters";
import { GoogleMap } from "@/components/map/GoogleMap";

const Map = () => {
  const [selectedTab, setSelectedTab] = useState<"all" | "children" | "sponsors">("all");
  const [showChildren, setShowChildren] = useState(true);
  const [showSponsors, setShowSponsors] = useState(true);
  
  // Get map data from custom hook
  const { children, sponsors, isLoading } = useMapData();

  // Handle filter changes
  const handleTabChange = (value: string) => {
    setSelectedTab(value as "all" | "children" | "sponsors");
    setShowChildren(value === "all" || value === "children");
    setShowSponsors(value === "all" || value === "sponsors");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Mapa de Ubicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <MapFilters 
            selectedTab={selectedTab}
            showChildren={showChildren}
            showSponsors={showSponsors}
            onTabChange={handleTabChange}
            onChildrenToggle={setShowChildren}
            onSponsorsToggle={setShowSponsors}
          />

          <GoogleMap 
            isLoading={isLoading}
            children={children}
            sponsors={sponsors}
            showChildren={showChildren}
            showSponsors={showSponsors}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Map;
