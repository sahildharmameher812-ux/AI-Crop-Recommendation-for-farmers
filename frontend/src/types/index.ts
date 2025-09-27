// Common types for the CropAI application

export interface Crop {
  id: string
  name: string
  scientificName?: string
  category: 'Cereal' | 'Vegetable' | 'Fruit' | 'Cash Crop' | 'Pulse' | 'Oilseed'
  season: 'Kharif' | 'Rabi' | 'Zaid'
  duration: number // in days
  emoji?: string
}

export interface SoilData {
  type: string
  ph: number
  nitrogen: number
  phosphorus: number
  potassium: number
  organicMatter?: number
  moisture?: number
}

export interface WeatherData {
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
}

export interface MarketPrice {
  crop: string
  currentPrice: number
  previousPrice: number
  change: number
  changePercent: number
  unit: string
  market: string
  quality: string
  trend: 'up' | 'down' | 'stable'
  demandLevel: 'high' | 'medium' | 'low'
  emoji: string
}

export interface CropRecommendation {
  name: string
  confidence: number
  expectedYield: string
  profitMargin: string
  investmentRequired: string
  duration: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  marketDemand: 'High' | 'Medium' | 'Low'
  waterRequirement: 'Low' | 'Medium' | 'High'
  pros: string[]
  cons: string[]
  tips: string[]
  emoji: string
}

export interface DiseaseAnalysis {
  disease: string
  confidence: number
  severity: 'Low' | 'Medium' | 'High'
  description: string
  causes: string[]
  symptoms: string[]
  treatments: string[]
  prevention: string[]
  affectedCrops: string[]
}

export interface FarmDetails {
  location: string
  landSize: number
  soilType: string
  irrigationType: string
  previousCrops?: string[]
  experience: 'Beginner' | 'Intermediate' | 'Expert'
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface User {
  id: string
  name: string
  email?: string
  phone?: string
  location: string
  farmDetails?: FarmDetails
}

// Form interfaces
export interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  category: string
  message: string
}

export interface RecommendationForm {
  location: string
  landSize: string
  soilType: string
  soilPh: string
  nitrogen: string
  phosphorus: string
  potassium: string
  season: string
  budget: string
  experience: string
  previousCrop: string
  irrigationType: string
}

// Navigation types
export interface NavigationItem {
  name: string
  path: string
  icon: React.ComponentType<any>
  solidIcon: React.ComponentType<any>
  description?: string
}

// Component props
export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined'
}

// Utility types
export type Status = 'idle' | 'loading' | 'success' | 'error'

export type Theme = 'light' | 'dark' | 'auto'

export type Language = 'en' | 'hi' | 'regional'

// Configuration types
export interface AppConfig {
  apiBaseUrl: string
  weatherApiKey?: string
  mapApiKey?: string
  supportedLanguages: Language[]
  defaultLanguage: Language
  theme: Theme
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Analytics types
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp: Date
}

export interface UsageStatistics {
  totalUsers: number
  activeUsers: number
  cropRecommendations: number
  diseaseDetections: number
  accuracy: number
}

// Feature flags
export interface FeatureFlags {
  enableWeatherIntegration: boolean
  enableMarketData: boolean
  enableOfflineMode: boolean
  enablePushNotifications: boolean
}

export default {
  // Re-export all types for easy importing
}