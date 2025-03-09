
// Type definitions for Google Maps JavaScript API
declare interface Window {
  google: typeof google;
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLngLiteral | LatLng): void;
      setZoom(zoom: number): void;
      setOptions(options: MapOptions): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latLng: LatLngLiteral | LatLng): void;
      setTitle(title: string): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map, anchor?: Marker): void;
      close(): void;
      setContent(content: string | Node): void;
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor();
      extend(latLng: LatLng | LatLngLiteral): this;
      getCenter(): LatLng;
      isEmpty(): boolean;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapOptions {
      center?: LatLngLiteral | LatLng;
      zoom?: number;
      mapTypeId?: string;
      mapTypeControl?: boolean;
      fullscreenControl?: boolean;
    }

    interface MarkerOptions {
      position: LatLngLiteral | LatLng;
      map?: Map;
      title?: string;
      icon?: string | Symbol;
    }

    interface InfoWindowOptions {
      content?: string | Node;
      position?: LatLngLiteral | LatLng;
    }

    interface MapsEventListener {
      remove(): void;
    }

    interface Symbol {
      path: SymbolPath | string;
      fillColor?: string;
      fillOpacity?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    enum SymbolPath {
      BACKWARD_CLOSED_ARROW,
      BACKWARD_OPEN_ARROW,
      CIRCLE,
      FORWARD_CLOSED_ARROW,
      FORWARD_OPEN_ARROW
    }
  }
}
