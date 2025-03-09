
import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Child, Sponsor } from "@/types";
import { getCoordinatesFromLocation, loadGoogleMapsScript, createCustomMarker } from "@/utils/map/googleMapsUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Type for props
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
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Function to initialize the map
  const initMap = () => {
    if (!window.google || !window.google.maps || !mapRef.current) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setApiKeyMissing(true);
    }

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
    if (!googleMap || !window.google) return;
    
    const newMarkers: google.maps.Marker[] = [];

    childrenData.forEach((child) => {
      if (!child.location) return;
      
      const coordinates = getCoordinatesFromLocation(child.location);
      
      if (coordinates) {
        try {
          const marker = createCustomMarker(
            googleMap,
            coordinates,
            child.name,
            "#7c3aed",
            "Niño"
          );
          newMarkers.push(marker);
        } catch (error) {
          console.error("Error creating child marker:", error);
        }
      }
    });

    setMarkers(prev => [...prev, ...newMarkers]);
  };

  // Add markers for sponsors
  const addSponsorsMarkers = (googleMap: google.maps.Map, sponsorsData: Sponsor[]) => {
    if (!googleMap || !window.google) return;
    
    const newMarkers: google.maps.Marker[] = [];

    sponsorsData.forEach((sponsor) => {
      const location = sponsor.city && sponsor.country ? `${sponsor.city}, ${sponsor.country}` : sponsor.city || sponsor.country;
      if (!location) return;
      
      const coordinates = getCoordinatesFromLocation(location);
      
      if (coordinates) {
        try {
          const marker = createCustomMarker(
            googleMap,
            coordinates,
            sponsor.name,
            "#f97316",
            "Padrino"
          );
          newMarkers.push(marker);
        } catch (error) {
          console.error("Error creating sponsor marker:", error);
        }
      }
    });

    setMarkers(prev => [...prev, ...newMarkers]);
  };

  // Clear existing markers
  const clearMarkers = () => {
    markers.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    setMarkers([]);
  };

  // Load map when component mounts
  useEffect(() => {
    if (!isLoading && !mapLoaded) {
      loadGoogleMapsScript(
        initMap,
        () => {
          toast.error("Error al cargar el mapa de Google, verifique su API key");
          setApiKeyMissing(true);
        }
      );
    }
  }, [isLoading, mapLoaded]);

  // Update markers when filters or data change
  useEffect(() => {
    if (!map || !mapLoaded) return;
    
    clearMarkers();
    
    if (children && children.length > 0 && showChildren) {
      addChildrenMarkers(map, children);
    }
    
    if (sponsors && sponsors.length > 0 && showSponsors) {
      addSponsorsMarkers(map, sponsors);
    }
  }, [showChildren, showSponsors, children, sponsors, mapLoaded, map]);

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
        {!mapLoaded && !isLoading && !apiKeyMissing && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Cargando el mapa...</p>
            </div>
          </div>
        )}
        
        {apiKeyMissing && (
          <div className="flex h-full items-center justify-center">
            <Alert className="max-w-md">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                Se requiere una clave de API de Google Maps válida para mostrar el mapa correctamente. 
                Por favor, configure la variable de entorno VITE_GOOGLE_MAPS_API_KEY.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};
