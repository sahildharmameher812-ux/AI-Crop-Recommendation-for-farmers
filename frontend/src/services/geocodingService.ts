interface Coordinates {
  lat: number
  lng: number
}

interface LocationResult {
  name: string
  coordinates: Coordinates
  address: {
    city?: string
    state?: string
    country?: string
    district?: string
    pincode?: string
  }
  bounds?: {
    northeast: Coordinates
    southwest: Coordinates
  }
}

interface ReverseGeocodingResult {
  name: string
  address: {
    city: string
    state: string
    country: string
    district?: string
    pincode?: string
    formattedAddress: string
  }
}

class GeocodingService {
  private googleApiKey: string
  private nominatimBaseUrl: string

  constructor() {
    this.googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    this.nominatimBaseUrl = 'https://nominatim.openstreetmap.org'
  }

  // Get current GPS location
  async getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      console.log('Requesting GPS location...')
      
      // Set a shorter timeout for faster fallback
      const timeoutId = setTimeout(() => {
        reject(new Error('Location request timed out after 8 seconds'))
      }, 8000)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          console.log('GPS location obtained:', position.coords)
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          clearTimeout(timeoutId)
          let errorMessage = 'Failed to get location'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user. Please allow location access in your browser settings.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your internet connection.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.'
              break
            default:
              errorMessage = `Location error: ${error.message}`
          }
          
          console.error('GPS Error:', errorMessage, error)
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: false, // Use less accurate but faster positioning
          timeout: 8000, // Reduce timeout to 8 seconds
          maximumAge: 600000 // Accept cached location up to 10 minutes old
        }
      )
    })
  }

  // Convert place name to coordinates (Geocoding)
  async geocodePlace(placeName: string): Promise<LocationResult> {
    // Try Google Geocoding API first (if API key available)
    if (this.googleApiKey) {
      try {
        return await this.geocodeWithGoogle(placeName)
      } catch (error) {
        console.warn('Google Geocoding failed, trying Nominatim:', error)
      }
    }

    // Fallback to free Nominatim API
    return await this.geocodeWithNominatim(placeName)
  }

  // Google Geocoding API
  private async geocodeWithGoogle(placeName: string): Promise<LocationResult> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeName)}&region=in&key=${this.googleApiKey}`
    )

    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'OK' || !data.results.length) {
      throw new Error(`No results found for "${placeName}"`)
    }

    const result = data.results[0]
    const location = result.geometry.location
    
    // Extract address components
    const addressComponents = result.address_components
    const address = this.parseGoogleAddressComponents(addressComponents)

    return {
      name: result.formatted_address,
      coordinates: {
        lat: location.lat,
        lng: location.lng
      },
      address,
      bounds: result.geometry.bounds ? {
        northeast: result.geometry.bounds.northeast,
        southwest: result.geometry.bounds.southwest
      } : undefined
    }
  }

  // Parse Google address components
  private parseGoogleAddressComponents(components: any[]): any {
    const address: any = {}

    for (const component of components) {
      const types = component.types

      if (types.includes('locality')) {
        address.city = component.long_name
      } else if (types.includes('administrative_area_level_2')) {
        address.district = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        address.state = component.long_name
      } else if (types.includes('country')) {
        address.country = component.long_name
      } else if (types.includes('postal_code')) {
        address.pincode = component.long_name
      }
    }

    return address
  }

  // Nominatim (OpenStreetMap) Geocoding API - Free alternative
  private async geocodeWithNominatim(placeName: string): Promise<LocationResult> {
    try {
      const response = await fetch(
        `${this.nominatimBaseUrl}/search?q=${encodeURIComponent(placeName)}&countrycodes=in&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CropAI-SmartFarming/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.length) {
        throw new Error(`No results found for "${placeName}"`)
      }

      const result = data[0]
      const addressDetails = result.address || {}

      return {
        name: result.display_name,
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        address: {
          city: addressDetails.city || addressDetails.town || addressDetails.village,
          state: addressDetails.state,
          country: addressDetails.country,
          district: addressDetails.state_district,
          pincode: addressDetails.postcode
        }
      }
    } catch (error) {
      console.warn('Nominatim API failed, trying fallback location data:', error)
      // Try fallback location data for Maharashtra
      return this.getFallbackLocationData(placeName)
    }
  }

  // Convert coordinates to place name (Reverse Geocoding)
  async reverseGeocode(coordinates: Coordinates): Promise<ReverseGeocodingResult> {
    // Try Google Reverse Geocoding API first (if API key available)
    if (this.googleApiKey) {
      try {
        return await this.reverseGeocodeWithGoogle(coordinates)
      } catch (error) {
        console.warn('Google Reverse Geocoding failed, trying Nominatim:', error)
      }
    }

    // Fallback to free Nominatim API
    return await this.reverseGeocodeWithNominatim(coordinates)
  }

  // Google Reverse Geocoding API
  private async reverseGeocodeWithGoogle(coordinates: Coordinates): Promise<ReverseGeocodingResult> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${this.googleApiKey}`
    )

    if (!response.ok) {
      throw new Error(`Google Reverse Geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'OK' || !data.results.length) {
      throw new Error('No address found for these coordinates')
    }

    const result = data.results[0]
    const addressComponents = result.address_components
    const address = this.parseGoogleAddressComponents(addressComponents)

    return {
      name: result.formatted_address,
      address: {
        city: address.city || 'Unknown City',
        state: address.state || 'Unknown State',
        country: address.country || 'India',
        district: address.district,
        pincode: address.pincode,
        formattedAddress: result.formatted_address
      }
    }
  }

  // Nominatim Reverse Geocoding API - Free alternative
  private async reverseGeocodeWithNominatim(coordinates: Coordinates): Promise<ReverseGeocodingResult> {
    const response = await fetch(
      `${this.nominatimBaseUrl}/reverse?lat=${coordinates.lat}&lon=${coordinates.lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CropAI-SmartFarming/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Nominatim Reverse Geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data || data.error) {
      throw new Error('No address found for these coordinates')
    }

    const addressDetails = data.address || {}

    return {
      name: data.display_name,
      address: {
        city: addressDetails.city || addressDetails.town || addressDetails.village || 'Unknown City',
        state: addressDetails.state || 'Unknown State', 
        country: addressDetails.country || 'India',
        district: addressDetails.state_district,
        pincode: addressDetails.postcode,
        formattedAddress: data.display_name
      }
    }
  }

  // Search for places with autocomplete suggestions
  async searchPlaces(query: string, limit: number = 5): Promise<LocationResult[]> {
    if (query.length < 2) return []

    try {
      if (this.googleApiKey) {
        return await this.searchPlacesWithGoogle(query, limit)
      } else {
        return await this.searchPlacesWithNominatim(query, limit)
      }
    } catch (error) {
      console.error('Place search error:', error)
      return []
    }
  }

  // Google Places Autocomplete API
  private async searchPlacesWithGoogle(query: string, limit: number): Promise<LocationResult[]> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&region=in&key=${this.googleApiKey}`
    )

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`)
    }

    const data = await response.json()

    return data.results.slice(0, limit).map((place: any) => ({
      name: place.name,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      address: {
        city: place.vicinity,
        state: '', // Would need additional call to get full address
        country: 'India'
      }
    }))
  }

  // Nominatim Places Search
  private async searchPlacesWithNominatim(query: string, limit: number): Promise<LocationResult[]> {
    const response = await fetch(
      `${this.nominatimBaseUrl}/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=${limit}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CropAI-SmartFarming/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Nominatim search API error: ${response.status}`)
    }

    const data = await response.json()

    return data.map((place: any) => ({
      name: place.display_name,
      coordinates: {
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon)
      },
      address: {
        city: place.address?.city || place.address?.town || place.address?.village,
        state: place.address?.state,
        country: place.address?.country || 'India',
        district: place.address?.state_district,
        pincode: place.address?.postcode
      }
    }))
  }

  // Get distance between two coordinates (in km)
  calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadian(coord2.lat - coord1.lat)
    const dLon = this.toRadian(coord2.lng - coord1.lng)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadian(coord1.lat)) * Math.cos(this.toRadian(coord2.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadian(degree: number): number {
    return degree * (Math.PI / 180)
  }

  // Get nearby cities/districts for market analysis
  async getNearbyPlaces(coordinates: Coordinates, radius: number = 50): Promise<LocationResult[]> {
    try {
      // Search for nearby places within radius
      const searchQuery = `cities near ${coordinates.lat},${coordinates.lng}`
      const nearbyPlaces = await this.searchPlaces(searchQuery, 10)
      
      // Filter by distance
      return nearbyPlaces.filter(place => {
        const distance = this.calculateDistance(coordinates, place.coordinates)
        return distance <= radius
      }).slice(0, 5)
    } catch (error) {
      console.error('Nearby places error:', error)
      return []
    }
  }

  // Fallback location data for Maharashtra districts and major cities
  private getFallbackLocationData(placeName: string): LocationResult {
    const searchTerm = placeName.toLowerCase().trim()
    
    // Maharashtra district and city data with coordinates
    const maharashtraPlaces: Record<string, LocationResult> = {
      'mumbai': {
        name: 'Mumbai, Maharashtra, India',
        coordinates: { lat: 19.0760, lng: 72.8777 },
        address: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          district: 'Mumbai City',
          pincode: '400001'
        }
      },
      'pune': {
        name: 'Pune, Maharashtra, India',
        coordinates: { lat: 18.5204, lng: 73.8567 },
        address: {
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India',
          district: 'Pune',
          pincode: '411001'
        }
      },
      'nashik': {
        name: 'Nashik, Maharashtra, India',
        coordinates: { lat: 19.9975, lng: 73.7898 },
        address: {
          city: 'Nashik',
          state: 'Maharashtra',
          country: 'India',
          district: 'Nashik',
          pincode: '422001'
        }
      },
      'aurangabad': {
        name: 'Aurangabad, Maharashtra, India',
        coordinates: { lat: 19.8762, lng: 75.3433 },
        address: {
          city: 'Aurangabad',
          state: 'Maharashtra',
          country: 'India',
          district: 'Aurangabad',
          pincode: '431001'
        }
      },
      'solapur': {
        name: 'Solapur, Maharashtra, India',
        coordinates: { lat: 17.6599, lng: 75.9064 },
        address: {
          city: 'Solapur',
          state: 'Maharashtra',
          country: 'India',
          district: 'Solapur',
          pincode: '413001'
        }
      },
      'nagpur': {
        name: 'Nagpur, Maharashtra, India',
        coordinates: { lat: 21.1458, lng: 79.0882 },
        address: {
          city: 'Nagpur',
          state: 'Maharashtra',
          country: 'India',
          district: 'Nagpur',
          pincode: '440001'
        }
      },
      'ahmednagar': {
        name: 'Ahmednagar, Maharashtra, India',
        coordinates: { lat: 19.0948, lng: 74.7480 },
        address: {
          city: 'Ahmednagar',
          state: 'Maharashtra',
          country: 'India',
          district: 'Ahmednagar',
          pincode: '414001'
        }
      },
      'kolhapur': {
        name: 'Kolhapur, Maharashtra, India',
        coordinates: { lat: 16.7050, lng: 74.2433 },
        address: {
          city: 'Kolhapur',
          state: 'Maharashtra',
          country: 'India',
          district: 'Kolhapur',
          pincode: '416001'
        }
      },
      'sangli': {
        name: 'Sangli, Maharashtra, India',
        coordinates: { lat: 16.8524, lng: 74.5815 },
        address: {
          city: 'Sangli',
          state: 'Maharashtra',
          country: 'India',
          district: 'Sangli',
          pincode: '416416'
        }
      },
      'palghar': {
        name: 'Palghar, Maharashtra, India',
        coordinates: { lat: 19.6966, lng: 72.7656 },
        address: {
          city: 'Palghar',
          state: 'Maharashtra',
          country: 'India',
          district: 'Palghar',
          pincode: '401404'
        }
      },
      'satara': {
        name: 'Satara, Maharashtra, India',
        coordinates: { lat: 17.6868, lng: 74.0178 },
        address: {
          city: 'Satara',
          state: 'Maharashtra',
          country: 'India',
          district: 'Satara',
          pincode: '415001'
        }
      }
    }
    
    // Try exact match first
    if (maharashtraPlaces[searchTerm]) {
      return maharashtraPlaces[searchTerm]
    }
    
    // Try partial match
    for (const [key, place] of Object.entries(maharashtraPlaces)) {
      if (key.includes(searchTerm) || searchTerm.includes(key)) {
        return place
      }
    }
    
    // Default fallback - return Mumbai coordinates with user's location name
    return {
      name: `${placeName}, Maharashtra, India (estimated)`,
      coordinates: { lat: 19.0760, lng: 72.8777 },
      address: {
        city: placeName,
        state: 'Maharashtra',
        country: 'India',
        district: 'Unknown',
        pincode: 'Unknown'
      }
    }
  }
}

export const geocodingService = new GeocodingService()
export type { Coordinates, LocationResult, ReverseGeocodingResult }