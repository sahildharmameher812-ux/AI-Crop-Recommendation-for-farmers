interface LocationRequest {
  place_name?: string
  latitude?: number
  longitude?: number
}

interface SoilDataResponse {
  N: number
  P: number
  K: number
  ph: number
  temperature: number
  humidity: number
  rainfall: number
  location_name: string
  confidence_score: number
  source: string
}

interface CropPredictionRequest {
  N: number
  P: number
  K: number
  temperature: number
  humidity: number
  ph: number
  rainfall: number
}

interface CropRecommendation {
  crop: string
  probability: number
  yield_kg_per_hectare: number
  expected_profit_local: number
  sustainability_score: number
}

interface CropPredictionResponse {
  recommendations: CropRecommendation[]
  meta: {
    mode: string
    model_accuracy: number
    total_crops: number
  }
}

class BackendService {
  private baseUrl: string
  private timeout: number

  constructor() {
    // Use localhost for development, can be configured via environment
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '15000')
  }

  // Test backend connection
  async testConnection(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        return false
      }
      
      const data = await response.json()
      console.log('Backend health check:', data)
      return data.status === 'ok'
    } catch (error) {
      console.warn('Backend connection failed:', error)
      return false
    }
  }

  // Fetch soil and environmental data based on location
  async getSoilData(locationRequest: LocationRequest): Promise<SoilDataResponse> {
    try {
      console.log('Fetching soil data for:', locationRequest)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      const response = await fetch(`${this.baseUrl}/soil-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationRequest),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Backend error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Received soil data:', data)
      
      return data
    } catch (error) {
      console.error('Failed to fetch soil data:', error)
      throw new Error(`Failed to get soil data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get crop recommendations based on environmental parameters
  async getCropRecommendations(params: CropPredictionRequest): Promise<CropPredictionResponse> {
    try {
      console.log('Getting crop recommendations for:', params)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Prediction error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Received crop recommendations:', data)
      
      return data
    } catch (error) {
      console.error('Failed to get crop recommendations:', error)
      throw new Error(`Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get comprehensive data for a location (soil + weather + recommendations)
  async getLocationAnalysis(locationRequest: LocationRequest): Promise<{
    soilData: SoilDataResponse
    cropRecommendations: CropPredictionResponse
  }> {
    try {
      // First get soil and environmental data
      const soilData = await this.getSoilData(locationRequest)
      
      // Then get crop recommendations using the soil data
      const cropRecommendations = await this.getCropRecommendations({
        N: soilData.N,
        P: soilData.P,
        K: soilData.K,
        ph: soilData.ph,
        temperature: soilData.temperature,
        humidity: soilData.humidity,
        rainfall: soilData.rainfall
      })

      return {
        soilData,
        cropRecommendations
      }
    } catch (error) {
      console.error('Failed to get location analysis:', error)
      throw error
    }
  }

  // Get weather data from backend
  async getWeatherData(lat: number, lon: number, days: number = 7): Promise<any> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&days=${days}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        }
      )
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Weather error ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get weather data:', error)
      throw error
    }
  }

  // Get market data from backend
  async getMarketData(): Promise<any> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      const response = await fetch(`${this.baseUrl}/market`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Market error ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get market data:', error)
      throw error
    }
  }
}

export const backendService = new BackendService()
export type { 
  LocationRequest, 
  SoilDataResponse, 
  CropPredictionRequest, 
  CropRecommendation, 
  CropPredictionResponse 
}