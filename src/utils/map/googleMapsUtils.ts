
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
  apiKey: string = "YOUR_API_KEY"
): void => {
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
    throw new Error("Google Maps API not loaded");
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
