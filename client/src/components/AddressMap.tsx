import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Loader2 } from "lucide-react";
import { AddressData } from './AddressAutocomplete';

interface AddressMapProps {
  address: AddressData;
  height?: string;
  width?: string;
  zoom?: number;
  onMarkerDragEnd?: (location: google.maps.LatLngLiteral) => void;
  draggable?: boolean;
}

const libraries: ("places")[] = ["places"];

export default function AddressMap({
  address,
  height = "300px",
  width = "100%",
  zoom = 16,
  onMarkerDragEnd,
  draggable = false
}: AddressMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries
  });

  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(
    address.lat && address.lng 
      ? { lat: address.lat, lng: address.lng } 
      : null
  );

  // Update center when address changes
  useEffect(() => {
    if (address.lat && address.lng) {
      setCenter({ lat: address.lat, lng: address.lng });
    } else if (address.formattedAddress && !center) {
      // Geocode the address if needed
      if (isLoaded && window.google) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address.formattedAddress }, (results, status) => {
          if (status === "OK" && results && results[0] && results[0].geometry && results[0].geometry.location) {
            const location = results[0].geometry.location;
            setCenter({ lat: location.lat(), lng: location.lng() });
          }
        });
      }
    }
  }, [address, isLoaded]);

  const handleMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng && onMarkerDragEnd) {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      onMarkerDragEnd(newPosition);
    }
  }, [onMarkerDragEnd]);

  if (loadError) {
    return <div className="text-red-500">Error loading maps</div>;
  }

  if (!isLoaded) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-md"
        style={{ height, width }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!center) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-md"
        style={{ height, width }}
      >
        <p className="text-muted-foreground">No location available</p>
      </div>
    );
  }

  return (
    <div style={{ height, width }}>
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%', borderRadius: '0.375rem' }}
        center={center}
        zoom={zoom}
        options={{ 
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true,
          mapTypeControl: false,
          streetViewControl: false
        }}
      >
        {center && (
          <Marker
            position={center}
            draggable={draggable}
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </GoogleMap>
    </div>
  );
}