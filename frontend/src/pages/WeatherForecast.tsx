import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CloudIcon,
  SunIcon,
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { EyeIcon as EyeDropperIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { weatherService } from '../services/weatherService'

interface WeatherData {
  location: string
  current: {
    temperature: number
    humidity: number
    windSpeed: number
    condition: string
    icon: string
    uvIndex: number
    rainfall: number
  }
  forecast: Array<{
    date: string
    day: string
    high: number
    low: number
    condition: string
    icon: string
    humidity: number
    rainfall: number
    windSpeed: number
  }>
  alerts: Array<{
    type: 'warning' | 'advisory' | 'watch'
    title: string
    description: string
    recommendation: string
  }>
  farmingAdvice: Array<{
    activity: string
    recommendation: string
    urgency: 'high' | 'medium' | 'low'
    icon: string
  }>
}

const WeatherForecast: React.FC = () => {
  const [location, setLocation] = useState('')
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentCoords, setCurrentCoords] = useState<{lat: number, lon: number} | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // Mock weather data
  const mockWeatherData: WeatherData = {
    location: 'Ranchi, Jharkhand',
    current: {
      temperature: 28,
      humidity: 75,
      windSpeed: 12,
      condition: 'Partly Cloudy',
      icon: '⛅',
      uvIndex: 6,
      rainfall: 2.5
    },
    forecast: [
      { date: '2024-09-27', day: 'Today', high: 30, low: 22, condition: 'Partly Cloudy', icon: '⛅', humidity: 75, rainfall: 2.5, windSpeed: 12 },
      { date: '2024-09-28', day: 'Tomorrow', high: 29, low: 21, condition: 'Light Rain', icon: '🌧️', humidity: 85, rainfall: 8.0, windSpeed: 15 },
      { date: '2024-09-29', day: 'Saturday', high: 26, low: 19, condition: 'Heavy Rain', icon: '⛈️', humidity: 90, rainfall: 25.0, windSpeed: 20 },
      { date: '2024-09-30', day: 'Sunday', high: 27, low: 20, condition: 'Cloudy', icon: '☁️', humidity: 80, rainfall: 5.0, windSpeed: 10 },
      { date: '2024-10-01', day: 'Monday', high: 31, low: 23, condition: 'Sunny', icon: '☀️', humidity: 60, rainfall: 0.0, windSpeed: 8 },
      { date: '2024-10-02', day: 'Tuesday', high: 32, low: 24, condition: 'Partly Cloudy', icon: '⛅', humidity: 65, rainfall: 0.0, windSpeed: 10 },
      { date: '2024-10-03', day: 'Wednesday', high: 28, low: 21, condition: 'Light Rain', icon: '🌦️', humidity: 80, rainfall: 12.0, windSpeed: 14 },
      { date: '2024-10-04', day: 'Thursday', high: 25, low: 18, condition: 'Moderate Rain', icon: '🌧️', humidity: 88, rainfall: 18.0, windSpeed: 16 },
      { date: '2024-10-05', day: 'Friday', high: 29, low: 22, condition: 'Partly Cloudy', icon: '⛅', humidity: 70, rainfall: 3.0, windSpeed: 11 },
      { date: '2024-10-06', day: 'Saturday', high: 33, low: 25, condition: 'Sunny', icon: '☀️', humidity: 55, rainfall: 0.0, windSpeed: 8 },
      { date: '2024-10-07', day: 'Sunday', high: 30, low: 23, condition: 'Cloudy', icon: '☁️', humidity: 72, rainfall: 2.0, windSpeed: 9 },
      { date: '2024-10-08', day: 'Monday', high: 27, low: 20, condition: 'Light Rain', icon: '🌦️', humidity: 85, rainfall: 15.0, windSpeed: 13 }
    ],
    alerts: [
      {
        type: 'warning',
        title: 'Heavy Rainfall Expected',
        description: 'Moderate to heavy rainfall expected on Saturday with 25mm+ precipitation',
        recommendation: 'Delay harvesting operations and ensure proper drainage in fields'
      },
      {
        type: 'advisory',
        title: 'High Humidity Alert',
        description: 'Humidity levels above 80% for the next 3 days may promote fungal diseases',
        recommendation: 'Monitor crops for signs of fungal infections and apply preventive fungicides'
      }
    ],
    farmingAdvice: [
      {
        activity: 'Irrigation',
        recommendation: 'Reduce irrigation frequency due to expected rainfall',
        urgency: 'medium',
        icon: '💧'
      },
      {
        activity: 'Harvesting',
        recommendation: 'Complete harvesting before Saturday\'s heavy rain',
        urgency: 'high',
        icon: '🚜'
      },
      {
        activity: 'Spraying',
        recommendation: 'Apply fungicides today before rain increases humidity',
        urgency: 'high',
        icon: '🧪'
      },
      {
        activity: 'Field Preparation',
        recommendation: 'Good conditions for field preparation after rain subsides',
        urgency: 'low',
        icon: '🌱'
      }
    ]
  }

  // Get current location using geolocation
  const getCurrentLocation = async () => {
    setIsGettingLocation(true)
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser')
      setIsGettingLocation(false)
      return
    }
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })
      
      const coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      }
      
      setCurrentCoords(coords)
      
      // Get location name from coordinates (reverse geocoding)
      const locationName = await getLocationName(coords.lat, coords.lon)
      setLocation(locationName)
      
      // Fetch weather data for current location
      await fetchWeatherDataByCoords(coords.lat, coords.lon, locationName)
      
    } catch (error: any) {
      console.error('Geolocation error:', error)
      if (error.code === 1) {
        toast.error('Location access denied. Please enable location permissions.')
      } else if (error.code === 2) {
        toast.error('Location unavailable. Please check your GPS settings.')
      } else {
        toast.error('Failed to get your current location')
      }
    } finally {
      setIsGettingLocation(false)
    }
  }
  
  // Simple reverse geocoding (fallback)
  const getLocationName = async (lat: number, lon: number): Promise<string> => {
    try {
      // For demo purposes, return a generic location based on coordinates
      // In a real app, you'd use a geocoding service
      if (lat >= 23 && lat <= 27 && lon >= 83 && lon <= 87) {
        return 'Ranchi, Jharkhand'
      } else if (lat >= 18 && lat <= 22 && lon >= 72 && lon <= 77) {
        return 'Mumbai, Maharashtra'
      } else if (lat >= 28 && lat <= 29 && lon >= 76 && lon <= 78) {
        return 'Delhi, India'
      } else {
        return `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`
      }
    } catch (error) {
      return `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`
    }
  }
  
  // Fetch weather data by coordinates
  const fetchWeatherDataByCoords = async (lat: number, lon: number, locationName: string) => {
    setIsLoading(true)
    try {
      // Simulate API call with actual weather service
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, you would use:
      // const extendedForecast = await weatherService.getExtendedWeatherForecast(lat, lon)
      
      setWeatherData({
        ...mockWeatherData,
        location: locationName
      })
      toast.success('12-day weather forecast loaded for your current location!')
    } catch (error) {
      console.error('Weather API error:', error)
      toast.error('Failed to fetch weather data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWeatherData = async () => {
    if (!location.trim()) {
      toast.error('Please enter a location')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setWeatherData({
        ...mockWeatherData,
        location: location
      })
      toast.success('12-day weather forecast loaded successfully!')
    } catch (error) {
      toast.error('Failed to fetch weather data')
    } finally {
      setIsLoading(false)
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-red-800 bg-red-100 border-red-200'
      case 'advisory': return 'text-orange-800 bg-orange-100 border-orange-200'
      case 'watch': return 'text-blue-800 bg-blue-100 border-blue-200'
      default: return 'text-gray-800 bg-gray-100 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
              <CloudIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">12-Day Weather Forecast</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get extended 12-day weather forecasts with current location support and agricultural recommendations
          </p>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              📍 Current Location Support
            </span>
            <span className="flex items-center">
              📅 12-Day Extended Forecast
            </span>
            <span className="flex items-center">
              🌾 Agricultural Insights
            </span>
          </div>
        </motion.div>

        {/* Location Input */}
        <motion.div
          className="agricultural-card max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  Enter Your Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Ranchi, Dhanbad, Jamshedpur"
                  className="agricultural-input"
                  onKeyPress={(e) => e.key === 'Enter' && fetchWeatherData()}
                />
              </div>
              <button
                onClick={fetchWeatherData}
                disabled={isLoading}
                className={`agricultural-button mt-6 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="loader w-4 h-4 mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Get Weather'
                )}
              </button>
            </div>
            
            {/* Current Location Button */}
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="text-sm text-gray-500 px-3">or</span>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation || isLoading}
                className={`inline-flex items-center px-6 py-3 rounded-xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200 hover:shadow-md ${
                  isGettingLocation || isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isGettingLocation ? (
                  <>
                    <div className="loader w-5 h-5 mr-2"></div>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <GlobeAltIcon className="w-5 h-5 mr-2" />
                    Use My Current Location
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                📍 Get accurate 12-day weather forecast for your exact location
              </p>
            </div>
          </div>
        </motion.div>

        {weatherData && (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Current Weather */}
            <div className="agricultural-card">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Current Weather - {weatherData.location}
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex items-center space-x-6">
                  <div className="text-6xl">{weatherData.current.icon}</div>
                  <div>
                    <div className="text-4xl font-bold text-gray-800">
                      {weatherData.current.temperature}°C
                    </div>
                    <div className="text-lg text-gray-600">
                      {weatherData.current.condition}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <EyeDropperIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Humidity</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {weatherData.current.humidity}%
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CloudIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Wind Speed</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {weatherData.current.windSpeed} km/h
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <SunIcon className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">UV Index</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {weatherData.current.uvIndex}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CloudArrowDownIcon className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Rainfall</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {weatherData.current.rainfall} mm
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Alerts */}
            {weatherData.alerts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Weather Alerts</h2>
                {weatherData.alerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    className={`p-6 rounded-2xl border-2 ${getAlertColor(alert.type)}`}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-start space-x-4">
                      <ExclamationTriangleIcon className="w-6 h-6 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{alert.title}</h3>
                        <p className="mb-3">{alert.description}</p>
                        <div className="bg-white/70 rounded-lg p-3">
                          <p className="font-medium">💡 Recommendation: {alert.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 12-Day Forecast */}
            <div className="agricultural-card">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <CalendarIcon className="w-6 h-6 mr-3" />
                12-Day Extended Forecast
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                📅 Plan your agricultural activities with our detailed 12-day weather outlook
              </p>
              <div className="space-y-6">
                {/* Week 1 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-3">
                      Week 1
                    </span>
                    Next 7 Days
                  </h3>
                  <div className="grid gap-4">
                    {weatherData.forecast.slice(0, 7).map((day, index) => (
                      <motion.div
                        key={index}
                        className={`rounded-xl p-4 border-2 ${
                          index === 0 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                            : index === 1
                            ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                            : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="grid md:grid-cols-6 gap-4 items-center">
                          <div className="md:col-span-2">
                            <div className="font-bold text-gray-800 text-lg flex items-center">
                              {day.day}
                              {index === 0 && <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Today</span>}
                              {index === 1 && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Tomorrow</span>}
                            </div>
                            <div className="text-sm text-gray-600">{day.date}</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl">{day.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{day.condition}</span>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800">{day.high}°</div>
                            <div className="text-sm text-gray-600">{day.low}°</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">{day.rainfall}mm</div>
                            <div className="text-xs text-gray-600">Rain</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">{day.windSpeed}</div>
                            <div className="text-xs text-gray-600">km/h</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Week 2 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3">
                      Week 2
                    </span>
                    Extended Outlook (Days 8-12)
                  </h3>
                  <div className="grid gap-3">
                    {weatherData.forecast.slice(7, 12).map((day, index) => (
                      <motion.div
                        key={index + 7}
                        className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: (index + 7) * 0.1 }}
                      >
                        <div className="grid md:grid-cols-6 gap-4 items-center">
                          <div className="md:col-span-2">
                            <div className="font-bold text-gray-800 text-base">{day.day}</div>
                            <div className="text-sm text-gray-600">{day.date}</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{day.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{day.condition}</span>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-800">{day.high}°</div>
                            <div className="text-sm text-gray-600">{day.low}°</div>
                          </div>
                          <div className="text-center">
                            <div className="text-base font-semibold text-blue-600">{day.rainfall}mm</div>
                            <div className="text-xs text-gray-600">Rain</div>
                          </div>
                          <div className="text-center">
                            <div className="text-base font-semibold text-green-600">{day.windSpeed}</div>
                            <div className="text-xs text-gray-600">km/h</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800">
                      ⚠️ <strong>Note:</strong> Extended forecasts (8+ days) have reduced accuracy. Use for general planning only.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Farming Advice */}
            <div className="agricultural-card">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                🌾 Farming Recommendations
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {weatherData.farmingAdvice.map((advice, index) => (
                  <motion.div
                    key={index}
                    className="bg-white border border-green-200 rounded-xl p-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{advice.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg text-gray-800">{advice.activity}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(advice.urgency)}`}>
                            {advice.urgency.charAt(0).toUpperCase() + advice.urgency.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600">{advice.recommendation}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Historical Weather Pattern */}
            <div className="agricultural-card">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📊 Weather Pattern Insights
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <h3 className="font-bold text-blue-800 mb-3">Rainfall Trend</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">Above Normal</div>
                  <p className="text-sm text-blue-700">
                    Current season rainfall is 15% above the 10-year average, favorable for Kharif crops.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                  <h3 className="font-bold text-orange-800 mb-3">Temperature Pattern</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-2">Normal</div>
                  <p className="text-sm text-orange-700">
                    Temperatures are within normal range, suitable for most agricultural activities.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <h3 className="font-bold text-green-800 mb-3">Growing Conditions</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">Excellent</div>
                  <p className="text-sm text-green-700">
                    Current weather conditions are optimal for crop growth and development.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default WeatherForecast