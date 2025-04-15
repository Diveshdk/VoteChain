"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface GeoLocationContextType {
  userLocation: {
    latitude: number | null
    longitude: number | null
    city: string | null
    country: string | null
    region: string | null
  }
  isLoading: boolean
  error: string | null
  refreshLocation: () => Promise<void>
  isInRadius: (targetLat: number, targetLng: number, radiusKm: number) => boolean
}

const GeoLocationContext = createContext<GeoLocationContextType>({
  userLocation: {
    latitude: null,
    longitude: null,
    city: null,
    country: null,
    region: null,
  },
  isLoading: true,
  error: null,
  refreshLocation: async () => {},
  isInRadius: () => false,
})

export const useGeoLocation = () => useContext(GeoLocationContext)

interface GeoLocationProviderProps {
  children: ReactNode
  apiKey?: string
}

export function GeoLocationProvider({ children, apiKey }: GeoLocationProviderProps) {
  const [userLocation, setUserLocation] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    city: null as string | null,
    country: null as string | null,
    region: null as string | null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  

  const fetchLocation = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Use IP geolocation API
      const apiUrl = apiKey ? `https://api.ipgeolocation.io/ipgeo?apiKey=${fa2ff877373d4dd497db78527b46326e}` : "https://ipapi.co/json/"

      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error || "Failed to get location data")
      }

      setUserLocation({
        latitude: data.latitude || data.lat,
        longitude: data.longitude || data.lon,
        city: data.city,
        country: data.country_name || data.country,
        region: data.region || data.region_name,
      })
    } catch (err) {
      console.error("Error fetching location:", err)
      setError("Unable to determine your location")
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return distance
  }

  const isInRadius = (targetLat: number, targetLng: number, radiusKm: number) => {
    if (!userLocation.latitude || !userLocation.longitude) return false

    const distance = calculateDistance(userLocation.latitude, userLocation.longitude, targetLat, targetLng)

    return distance <= radiusKm
  }

  useEffect(() => {
    fetchLocation()
  }, [])

  return (
    <GeoLocationContext.Provider
      value={{
        userLocation,
        isLoading,
        error,
        refreshLocation: fetchLocation,
        isInRadius,
      }}
    >
      {children}
    </GeoLocationContext.Provider>
  )
}

