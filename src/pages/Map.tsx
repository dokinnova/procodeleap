
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Child, Sponsor } from "@/types";
import { MapPin, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "child" | "sponsor";
}

const Map = () => {
  const [selectedTab, setSelectedTab] = useState<"all" | "children" | "sponsors">("all");
  const [showChildren, setShowChildren] = useState(true);
  const [showSponsors, setShowSponsors] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Fetch children data
  const { data: children, isLoading: isLoadingChildren } = useQuery({
    queryKey: ["children-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("id, name, location")
        .not("location", "is", null);
      
      if (error) throw error;
      return data as Child[];
    },
  });

  // Fetch sponsors data
  const { data: sponsors, isLoading: isLoadingSponsors } = useQuery({
    queryKey: ["sponsors-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("id, name, city, country")
        .not("city", "is", null);
      
      if (error) throw error;
      return data as Sponsor[];
    },
  });

  const isLoading = isLoadingChildren || isLoadingSponsors;

  // Function to initialize the map
  const initMap = () => {
    if (!window.google || mapLoaded) return;

    const mapDiv = document.getElementById("map");
    if (!mapDiv) return;

    const googleMap = new window.google.maps.Map(mapDiv, {
      center: { lat: 15, lng: -10 },
      zoom: 2,
      mapTypeControl: true,
      fullscreenControl: true,
    });

    setMap(googleMap);
    setMapLoaded(true);
    
    // Update markers after map is initialized
    if (children && showChildren) {
      addChildrenMarkers(googleMap, children);
    }
    
    if (sponsors && showSponsors) {
      addSponsorsMarkers(googleMap, sponsors);
    }
  };

  // Add markers for children
  const addChildrenMarkers = (googleMap: google.maps.Map, childrenData: Child[]) => {
    const newMarkers: google.maps.Marker[] = [];

    childrenData.forEach((child) => {
      // Convert location to coordinates
      const coordinates = getCoordinatesFromLocation(child.location);
      
      if (coordinates) {
        const marker = new window.google.maps.Marker({
          position: coordinates,
          map: googleMap,
          title: child.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#7c3aed",
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 8,
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div class="p-2"><strong>${child.name}</strong><br/>Niño</div>`,
        });

        marker.addListener("click", () => {
          infoWindow.open(googleMap, marker);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(prev => [...prev, ...newMarkers]);
  };

  // Add markers for sponsors
  const addSponsorsMarkers = (googleMap: google.maps.Map, sponsorsData: Sponsor[]) => {
    const newMarkers: google.maps.Marker[] = [];

    sponsorsData.forEach((sponsor) => {
      // Convert location to coordinates
      const location = sponsor.city && sponsor.country ? `${sponsor.city}, ${sponsor.country}` : sponsor.city || sponsor.country;
      const coordinates = getCoordinatesFromLocation(location);
      
      if (coordinates) {
        const marker = new window.google.maps.Marker({
          position: coordinates,
          map: googleMap,
          title: sponsor.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#f97316",
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 8,
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div class="p-2"><strong>${sponsor.name}</strong><br/>Padrino</div>`,
        });

        marker.addListener("click", () => {
          infoWindow.open(googleMap, marker);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(prev => [...prev, ...newMarkers]);
  };

  // Helper function to convert location string to coordinates
  const getCoordinatesFromLocation = (location: string): google.maps.LatLngLiteral | null => {
    // This is a placeholder implementation
    // In a real application, you would use geocoding
    const hash = location.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + acc;
    }, 0);
    
    // Generate some pseudo-random coordinates based on the string
    const lat = ((hash % 180) - 90) * 0.8;
    const lng = ((hash % 360) - 180) * 0.8;
    
    return { lat, lng };
  };

  // Clear existing markers
  const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  // Update markers when filters change
  useEffect(() => {
    if (!map || !mapLoaded) return;
    
    clearMarkers();
    
    if (children && showChildren) {
      addChildrenMarkers(map, children);
    }
    
    if (sponsors && showSponsors) {
      addSponsorsMarkers(map, sponsors);
    }
  }, [showChildren, showSponsors, selectedTab, mapLoaded]);

  // Load Google Maps script
  const loadGoogleMapsScript = () => {
    if (!document.getElementById("google-maps-script") && typeof window.google === 'undefined') {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        toast.error("Error al cargar el mapa de Google, verifique su API key");
      };
      document.head.appendChild(script);
    } else if (window.google) {
      initMap();
    }
  };

  // Load map when data is ready
  useEffect(() => {
    if (!isLoading && !mapLoaded) {
      loadGoogleMapsScript();
    }
  }, [isLoading, mapLoaded]);

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
          <div className="mb-4">
            <Tabs defaultValue="all" onValueChange={handleTabChange}>
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
                onCheckedChange={setShowChildren}
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
                onCheckedChange={setShowSponsors}
              />
              <Label htmlFor="show-sponsors" className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                Padrinos
              </Label>
            </div>
          </div>

          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            
            <div 
              id="map" 
              className="w-full h-[500px] rounded-md border"
              style={{ backgroundColor: "#f0f0f0" }}
            >
              {!mapLoaded && (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Cargando el mapa...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Map;
