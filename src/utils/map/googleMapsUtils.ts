
// Helper function to convert location string to coordinates
export const getCoordinatesFromLocation = (location: string): { lat: number; lng: number } | null => {
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

// Load Google Maps script
export const loadGoogleMapsScript = (
  callback: () => void,
  onError: () => void,
  apiKey: string = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
): void => {
  // Check if API key is empty and handle accordingly
  if (!apiKey) {
    console.warn("Google Maps API key is missing. Using a demo mode with limited functionality.");
    // Create a mock Google Maps API to prevent errors
    if (!window.google) {
      window.google = {
        maps: {
          Map: function(element: HTMLElement, options: any) {
            // Minimal mock implementation
            this.setCenter = () => {};
            this.setZoom = () => {};
            this.setOptions = () => {};
            
            // Add a message to the element about missing API key
            const message = document.createElement('div');
            message.innerHTML = `
              <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
                <h3 style="margin-bottom: 10px;">Mapa no disponible</h3>
                <p>Se requiere una clave de API de Google Maps válida.</p>
              </div>
            `;
            element.appendChild(message);
          },
          Marker: function() {
            this.setMap = () => {};
            this.addListener = () => {};
          },
          InfoWindow: function() {
            this.open = () => {};
          },
          LatLngBounds: function() {
            this.extend = () => {};
          },
          SymbolPath: {
            CIRCLE: 0
          },
          event: {
            addListener: () => {}
          }
        }
      };
    }
    callback();
    return;
  }
  
  // If script is already loaded, execute callback
  if (window.google && window.google.maps) {
    callback();
    return;
  }
  
  // If script is already being loaded (exists in DOM), wait for it
  const existingScript = document.getElementById("google-maps-script");
  if (existingScript) {
    existingScript.addEventListener("load", callback);
    existingScript.addEventListener("error", onError);
    return;
  }
  
  // Otherwise create and load the script
  const script = document.createElement("script");
  script.id = "google-maps-script";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  script.onerror = onError;
  document.head.appendChild(script);
};

// Function to create a custom marker
export const createCustomMarker = (
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  title: string,
  color: string,
  type: string
): google.maps.Marker => {
  // Check if Google Maps is available
  if (!window.google || !window.google.maps) {
    console.warn("Google Maps API not loaded properly");
    return {} as google.maps.Marker;
  }

  const marker = new window.google.maps.Marker({
    position,
    map,
    title,
    icon: {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 0,
      scale: 8,
    },
  });

  const infoWindow = new window.google.maps.InfoWindow({
    content: `<div class="p-2"><strong>${title}</strong><br/>${type}</div>`,
  });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });

  return marker;
};
