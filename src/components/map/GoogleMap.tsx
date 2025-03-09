
import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Child, Sponsor } from "@/types";
import { getCoordinatesFromLocation, loadGoogleMapsScript, createCustomMarker } from "@/utils/map/googleMapsUtils";

interface GoogleMapProps {
  isLoading: boolean;
  children?: Child[];
  sponsors?: Sponsor[];
  showChildren: boolean;
  showSponsors: boolean;
}

export const GoogleMap = ({
  isLoading,
  children = [],
  sponsors = [],
  showChildren,
  showSponsors,
}: GoogleMapProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Function to initialize the map
  const initMap = () => {
    if (!window.google || !window.google.maps || !mapRef.current) return;

    const googleMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 15, lng: -10 },
      zoom: 2,
      mapTypeControl: true,
      fullscreenControl: true,
    });

    setMap(googleMap);
    setMapLoaded(true);
  };

  // Add markers for children
  const addChildrenMarkers = (googleMap: google.maps.Map, childrenData: Child[]) => {
    const newMarkers: google.maps.Marker[] = [];

    childrenData.forEach((child) => {
      const coordinates = getCoordinatesFromLocation(child.location);
      
      if (coordinates) {
        const marker = createCustomMarker(
          googleMap,
          coordinates,
          child.name,
          "#7c3aed",
          "Niño"
        );
        newMarkers.push(marker);
      }
    });

    setMarkers(prev => [...prev, ...newMarkers]);
  };

  // Add markers for sponsors
  const addSponsorsMarkers = (googleMap: google.maps.Map, sponsorsData: Sponsor[]) => {
    const newMarkers: google.maps.Marker[] = [];

    sponsorsData.forEach((sponsor) => {
      const location = sponsor.city && sponsor.country ? `${sponsor.city}, ${sponsor.country}` : sponsor.city || sponsor.country;
      const coordinates = getCoordinatesFromLocation(location);
      
      if (coordinates) {
        const marker = createCustomMarker(
          googleMap,
          coordinates,
          sponsor.name,
          "#f97316",
          "Padrino"
        );
        newMarkers.push(marker);
      }
    });

    setMarkers(prev => [...prev, ...newMarkers]);
  };

  // Clear existing markers
  const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  // Load map when component mounts
  useEffect(() => {
    if (!isLoading && !mapLoaded) {
      loadGoogleMapsScript(
        initMap,
        () => toast.error("Error al cargar el mapa de Google, verifique su API key")
      );
    }
  }, [isLoading, mapLoaded]);

  // Update markers when filters or data change
  useEffect(() => {
    if (!map || !mapLoaded) return;
    
    clearMarkers();
    
    if (children && showChildren) {
      addChildrenMarkers(map, children);
    }
    
    if (sponsors && showSponsors) {
      addSponsorsMarkers(map, sponsors);
    }
  }, [showChildren, showSponsors, children, sponsors, mapLoaded]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      <div 
        ref={mapRef}
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
  );
};
