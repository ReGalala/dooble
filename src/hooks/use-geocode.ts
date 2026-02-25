import { useState, useCallback } from "react";

interface GeocodeResult {
  lat: number;
  lng: number;
}

export function useGeocode() {
  const [geocoding, setGeocoding] = useState(false);

  const geocodeAddress = useCallback(async (address: string): Promise<GeocodeResult | null> => {
    if (!address.trim()) return null;
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address.trim())}`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch {
      return null;
    } finally {
      setGeocoding(false);
    }
  }, []);

  return { geocodeAddress, geocoding };
}
