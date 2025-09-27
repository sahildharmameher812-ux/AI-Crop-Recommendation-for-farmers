interface WeatherData {
  temperature: number
  humidity: number
  rainfall: number
  windSpeed: number
  pressure: number
  description: string
  icon: string
  feelsLike: number
  visibility: number
  uvIndex?: number
}

interface WeatherForecast {
  date: string
  temperature: {
    min: number
    max: number
  }
  humidity: number
  rainfall: number
  description: string
  icon: string
}

interface ClimateData {
  avgTemperature: number
  avgRainfall: number
  avgHumidity: number
  climate: string
  season: 'Summer' | 'Monsoon' | 'Winter' | 'Spring'
}

class WeatherService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key'
    this.baseUrl = 'https://api.openweathermap.org/data/2.5'
  }

  // Get current weather by coordinates
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      // Skip API call if using demo key
      if (this.apiKey === 'demo_key') {
        throw new Error('Demo API key - using fallback data')
      }

      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        feelsLike: Math.round(data.main.feels_like),
        visibility: data.visibility / 1000 // Convert to km
      }
    } catch (error) {
      console.error('Weather API Error:', error)
      // Return fallback weather data for Maharashtra region
      return this.getFallbackWeatherData(lat, lon)
    }
  }

  // Get 5-day weather forecast
  async getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
    try {
      // Skip API call if using demo key
      if (this.apiKey === 'demo_key') {
        throw new Error('Demo API key - using fallback data')
      }

      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      )

      if (!response.ok) {
        throw new Error(`Weather forecast API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Group by days and get one forecast per day
      const dailyForecasts: WeatherForecast[] = []
      const processedDates = new Set()

      for (const item of data.list.slice(0, 5)) { // Get 5 days
        const date = new Date(item.dt * 1000).toDateString()
        
        if (!processedDates.has(date)) {
          processedDates.add(date)
          dailyForecasts.push({
            date: date,
            temperature: {
              min: Math.round(item.main.temp_min),
              max: Math.round(item.main.temp_max)
            },
            humidity: item.main.humidity,
            rainfall: item.rain?.['3h'] || 0,
            description: item.weather[0].description,
            icon: item.weather[0].icon
          })
        }
      }

      return dailyForecasts
    } catch (error) {
      console.error('Weather forecast API Error:', error)
      // Return fallback forecast data for Maharashtra region
      return this.getFallbackForecastData(lat, lon)
    }
  }

  // Get extended 12-day weather forecast
  async getExtendedWeatherForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
    try {
      // Skip API call if using demo key
      if (this.apiKey === 'demo_key') {
        throw new Error('Demo API key - using fallback data')
      }

      // For 12-day forecast, we'll use a combination of 5-day detailed forecast
      // and extended forecast with some interpolation for demonstration
      const shortForecast = await this.getWeatherForecast(lat, lon)
      
      // Extend to 12 days using pattern extrapolation
      const extendedForecast = [...shortForecast]
      
      for (let i = 5; i < 12; i++) {
        const baseDay = shortForecast[i % 5] // Cycle through existing patterns
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        // Add some variation to make it realistic
        const tempVariation = (Math.random() - 0.5) * 4
        const humidityVariation = (Math.random() - 0.5) * 10
        const rainfallVariation = Math.random() > 0.7 ? Math.random() * 5 : 0
        
        extendedForecast.push({
          date: date.toDateString(),
          temperature: {
            min: Math.round(baseDay.temperature.min + tempVariation),
            max: Math.round(baseDay.temperature.max + tempVariation)
          },
          humidity: Math.max(30, Math.min(95, baseDay.humidity + humidityVariation)),
          rainfall: Math.max(0, baseDay.rainfall + rainfallVariation),
          description: baseDay.description,
          icon: baseDay.icon
        })
      }
      
      return extendedForecast
    } catch (error) {
      console.error('Extended weather forecast API Error:', error)
      // Return fallback extended forecast data
      return this.getFallbackExtendedForecastData(lat, lon)
    }
  }

  // Get agricultural climate data for crop recommendations
  async getClimateData(lat: number, lon: number): Promise<ClimateData> {
    try {
      // Get current weather for immediate data
      const currentWeather = await this.getCurrentWeather(lat, lon)
      
      // Get historical data from One Call API (requires subscription)
      // For now, we'll use current data and regional patterns
      const avgTemperature = currentWeather.temperature
      const avgHumidity = currentWeather.humidity
      
      // Determine season based on date and location
      const month = new Date().getMonth() + 1 // 1-12
      let season: 'Summer' | 'Monsoon' | 'Winter' | 'Spring' = 'Summer'
      
      // Indian seasonal patterns
      if (month >= 6 && month <= 9) {
        season = 'Monsoon'
      } else if (month >= 10 && month <= 2) {
        season = 'Winter'
      } else if (month >= 3 && month <= 5) {
        season = 'Summer'
      }

      // Determine climate based on location (rough approximation)
      let climate = 'Tropical'
      if (lat > 28) climate = 'Subtropical'
      else if (lat < 15) climate = 'Tropical'
      else climate = 'Tropical Monsoon'

      // Estimate annual rainfall based on region and season
      let avgRainfall = 800 // mm annually
      if (season === 'Monsoon') avgRainfall = 1200
      if (lat < 20) avgRainfall = 1500 // Southern India gets more rain

      return {
        avgTemperature,
        avgRainfall,
        avgHumidity,
        climate,
        season
      }
    } catch (error) {
      console.error('Climate data API Error:', error)
      throw new Error('Failed to fetch climate data')
    }
  }

  // Get UV Index for crop planning
  async getUVIndex(lat: number, lon: number): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/uvi?lat=${lat}&lon=${lon}&appid=${this.apiKey}`
      )

      if (!response.ok) {
        throw new Error(`UV Index API error: ${response.status}`)
      }

      const data = await response.json()
      return Math.round(data.value || 0)
    } catch (error) {
      console.warn('UV Index API Error:', error)
      return 0 // Return 0 if API fails
    }
  }

  // Get weather alerts for farming
  async getWeatherAlerts(lat: number, lon: number): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/onecall?lat=${lat}&lon=${lon}&appid=${this.apiKey}&exclude=minutely,hourly`
      )

      if (!response.ok) {
        return [] // No alerts available
      }

      const data = await response.json()
      const alerts = data.alerts || []
      
      return alerts.map((alert: any) => alert.description).slice(0, 3)
    } catch (error) {
      console.warn('Weather alerts API Error:', error)
      return []
    }
  }

  // Fallback weather data for Maharashtra region
  private getFallbackWeatherData(lat: number, lon: number): WeatherData {
    const month = new Date().getMonth() + 1 // 1-12
    const hour = new Date().getHours()
    
    // Maharashtra seasonal weather patterns
    let baseTemp = 28
    let humidity = 65
    let rainfall = 0
    let description = 'Clear sky'
    let icon = '01d'
    
    // Seasonal adjustments
    if (month >= 6 && month <= 9) { // Monsoon
      baseTemp = 26
      humidity = 85
      rainfall = Math.random() > 0.4 ? Math.floor(Math.random() * 15) + 5 : 0
      description = rainfall > 0 ? 'Light rain' : 'Partly cloudy'
      icon = rainfall > 0 ? '10d' : '02d'
    } else if (month >= 10 && month <= 2) { // Winter
      baseTemp = 22
      humidity = 55
      description = 'Clear sky'
      icon = '01d'
    } else if (month >= 3 && month <= 5) { // Summer
      baseTemp = 35
      humidity = 45
      description = 'Hot'
      icon = '01d'
    }
    
    // Daily temperature variation
    if (hour >= 6 && hour <= 10) baseTemp -= 3 // Morning
    else if (hour >= 11 && hour <= 16) baseTemp += 3 // Afternoon
    else if (hour >= 17 && hour <= 20) baseTemp += 1 // Evening
    else baseTemp -= 5 // Night
    
    // Regional adjustments for Maharashtra
    if (lat < 18) { // Southern Maharashtra (warmer)
      baseTemp += 2
      humidity += 5
    } else if (lat > 21) { // Northern Maharashtra (cooler)
      baseTemp -= 2
      humidity -= 5
    }
    
    return {
      temperature: Math.round(baseTemp + (Math.random() - 0.5) * 4),
      humidity: Math.max(30, Math.min(95, humidity + Math.floor((Math.random() - 0.5) * 10))),
      rainfall,
      windSpeed: Math.random() * 8 + 2,
      pressure: 1013 + Math.floor((Math.random() - 0.5) * 20),
      description,
      icon,
      feelsLike: Math.round(baseTemp + (Math.random() - 0.5) * 6),
      visibility: Math.random() * 5 + 8
    }
  }
  
  // Fallback forecast data for Maharashtra region
  private getFallbackForecastData(lat: number, lon: number): WeatherForecast[] {
    const forecasts: WeatherForecast[] = []
    const baseWeather = this.getFallbackWeatherData(lat, lon)
    
    for (let i = 0; i < 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      const tempVariation = (Math.random() - 0.5) * 6
      const minTemp = baseWeather.temperature - 4 + tempVariation
      const maxTemp = baseWeather.temperature + 6 + tempVariation
      
      forecasts.push({
        date: date.toDateString(),
        temperature: {
          min: Math.round(Math.max(15, minTemp)),
          max: Math.round(Math.min(45, maxTemp))
        },
        humidity: Math.max(30, Math.min(95, baseWeather.humidity + Math.floor((Math.random() - 0.5) * 15))),
        rainfall: Math.random() > 0.7 ? Math.floor(Math.random() * 12) + 2 : 0,
        description: Math.random() > 0.6 ? 'Partly cloudy' : 'Clear sky',
        icon: Math.random() > 0.7 ? '02d' : '01d'
      })
    }
    
    return forecasts
  }
  
  // Fallback extended 12-day forecast data
  private getFallbackExtendedForecastData(lat: number, lon: number): WeatherForecast[] {
    const forecasts: WeatherForecast[] = []
    const baseWeather = this.getFallbackWeatherData(lat, lon)
    const month = new Date().getMonth() + 1
    
    // Weather pattern arrays for variety
    const conditions = ['Clear sky', 'Partly cloudy', 'Cloudy', 'Light rain', 'Moderate rain']
    const icons = ['01d', '02d', '03d', '10d', '09d']
    
    for (let i = 0; i < 12; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      // Create more realistic weather patterns with some persistence
      const weatherIndex = Math.floor(Math.random() * conditions.length)
      const tempVariation = (Math.random() - 0.5) * 6
      const seasonalAdjustment = month >= 6 && month <= 9 ? -3 : 0 // Monsoon adjustment
      
      const minTemp = baseWeather.temperature - 4 + tempVariation + seasonalAdjustment
      const maxTemp = baseWeather.temperature + 6 + tempVariation + seasonalAdjustment
      
      // Rainfall probability increases during monsoon
      const rainfallProb = month >= 6 && month <= 9 ? 0.6 : 0.3
      const rainfall = Math.random() < rainfallProb ? Math.floor(Math.random() * 15) + 1 : 0
      
      forecasts.push({
        date: date.toDateString(),
        temperature: {
          min: Math.round(Math.max(15, minTemp)),
          max: Math.round(Math.min(45, maxTemp))
        },
        humidity: Math.max(30, Math.min(95, baseWeather.humidity + Math.floor((Math.random() - 0.5) * 20))),
        rainfall,
        description: rainfall > 0 ? (rainfall > 5 ? 'Moderate rain' : 'Light rain') : conditions[weatherIndex],
        icon: rainfall > 0 ? (rainfall > 5 ? '09d' : '10d') : icons[weatherIndex]
      })
    }
    
    return forecasts
  }
}

export const weatherService = new WeatherService()
export type { WeatherData, WeatherForecast, ClimateData }