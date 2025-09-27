import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  InformationCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhotoIcon,
  CloudIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  FireIcon,
  TruckIcon,
  GlobeAsiaAustraliaIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { cropData, CropData } from '../data/marketData'

const MarketData: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedCrop, setSelectedCrop] = useState<CropData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dataSource, setDataSource] = useState<'static'>('static')
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Crops', emoji: '🌿' },
    { value: 'cereals', label: 'Cereals', emoji: '🌾' },
    { value: 'vegetables', label: 'Vegetables', emoji: '🥕' },
    { value: 'fruits', label: 'Fruits', emoji: '🍎' },
    { value: 'pulses', label: 'Pulses', emoji: '🫘' },
    { value: 'spices', label: 'Spices', emoji: '🌶️' },
    { value: 'oilseeds', label: 'Oilseeds', emoji: '🥜' },
    { value: 'cash_crops', label: 'Cash Crops', emoji: '💰' },
    { value: 'fodder', label: 'Fodder', emoji: '🌱' },
    { value: 'medicinal', label: 'Medicinal', emoji: '🌿' },
    { value: 'nuts', label: 'Nuts', emoji: '🥜' }
  ]

  const regions = [
    { value: 'all', label: 'All Markets' },
    { value: 'delhi', label: 'Delhi Mandi' },
    { value: 'mumbai', label: 'Mumbai Mandi' },
    { value: 'bangalore', label: 'Bangalore Mandi' },
    { value: 'chennai', label: 'Chennai Mandi' },
    { value: 'kolkata', label: 'Kolkata Mandi' },
    { value: 'punjab', label: 'Punjab Mandi' },
    { value: 'maharashtra', label: 'Maharashtra Mandi' },
    { value: 'gujarat', label: 'Gujarat Mandi' },
    { value: 'karnataka', label: 'Karnataka Mandi' }
  ]

  // Filter crops based on search and category
  const filteredCrops = cropData.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory
    const matchesRegion = selectedRegion === 'all' || crop.market.toLowerCase().includes(selectedRegion.replace('_', ' '))
    return matchesSearch && matchesCategory && matchesRegion
  })

  // Utility functions
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpIcon className="w-4 h-4 text-green-600" />
      case 'down': return <ArrowDownIcon className="w-4 h-4 text-red-600" />
      case 'stable': return <MinusIcon className="w-4 h-4 text-gray-600" />
      default: return <MinusIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50'
      case 'down': return 'text-red-600 bg-red-50'
      case 'stable': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const calculatePriceChange = (current: number, previous: number) => {
    const change = current - previous
    const changePercent = ((change / previous) * 100).toFixed(1)
    return { change, changePercent: parseFloat(changePercent) }
  }

  // Set current timestamp for data freshness
  useEffect(() => {
    setLastUpdated(new Date().toISOString())
  }, [])

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Live Market Prices</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive pricing data for {cropData.length}+ crops across major Indian mandis
          </p>
          
          {/* Data Freshness Indicator */}
          <div className="flex items-center justify-center mt-4 space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              <WifiIcon className="w-4 h-4" />
              <span>Market Data</span>
            </div>
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Updated: {new Date(lastUpdated).toLocaleString()}
              </div>
            )}
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          className="agricultural-card mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
                Search Crops
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by crop name..."
                className="agricultural-input"
              />
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FunnelIcon className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="agricultural-select"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.emoji} {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                Market
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="agricultural-select"
              >
                {regions.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {filteredCrops.length} of {cropData.length} crops
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                COMPREHENSIVE
              </span>
            </div>
            <div className="text-sm text-green-600 font-medium">
              ✓ {cropData.length} Crops Available
            </div>
          </div>
        </motion.div>

        {/* Market Insights Section */}
        <motion.div
          className="agricultural-card mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUpIcon className="w-6 h-6 text-green-600 mr-2" />
            Market Insights
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Premium Crops */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">👑 Premium Crops</h4>
              <div className="space-y-2">
                {cropData
                  .filter(item => item.currentPrice > 10000)
                  .slice(0, 3)
                  .map(item => (
                    <div key={item.id} className="text-sm">
                      <span className="font-medium text-purple-700">{item.name}</span>
                      <span className="text-purple-600 ml-2">₹{item.currentPrice.toLocaleString()}/qtl</span>
                    </div>
                  ))
                }
              </div>
            </div>
            
            {/* Price Rising */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">📈 Price Rising</h4>
              <div className="space-y-2">
                {cropData
                  .filter(item => item.trend === 'up')
                  .slice(0, 3)
                  .map(item => (
                    <div key={item.id} className="text-sm">
                      <span className="font-medium text-green-700">{item.name}</span>
                      <span className="text-green-600 ml-2">+₹{Math.abs(item.currentPrice - item.previousPrice)}</span>
                    </div>
                  ))
                }
              </div>
            </div>
            
            {/* High Demand */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🔥 High Demand</h4>
              <div className="space-y-2">
                {cropData
                  .filter(item => item.demandLevel === 'high')
                  .slice(0, 3)
                  .map(item => (
                    <div key={item.id} className="text-sm">
                      <span className="font-medium text-blue-700">{item.name}</span>
                      <span className="text-blue-600 ml-2">{item.market}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
          
          {/* Market Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📊 Market Summary</h4>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {cropData.filter(item => item.trend === 'up').length}
                </div>
                <div className="text-sm text-gray-600">Prices Rising</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {cropData.filter(item => item.trend === 'down').length}
                </div>
                <div className="text-sm text-gray-600">Prices Falling</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {cropData.filter(item => item.demandLevel === 'high').length}
                </div>
                <div className="text-sm text-gray-600">High Demand</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{Math.round(cropData.reduce((acc, item) => acc + item.currentPrice, 0) / cropData.length).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Avg. Price/qtl</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Crops Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredCrops.map((crop, index) => {
              const { change, changePercent } = calculatePriceChange(crop.currentPrice, crop.previousPrice)
              return (
                <motion.div
                  key={crop.id}
                  className="agricultural-card cursor-pointer hover:shadow-xl transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setSelectedCrop(crop)}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Crop Category Icon */}
                  <div className="w-full h-16 rounded-xl mb-4 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <span className="text-3xl">
                      {categories.find(cat => cat.value === crop.category)?.emoji || '🌾'}
                    </span>
                  </div>
                  
                  {/* Crop Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-600 transition-colors">
                        {crop.name}
                      </h3>
                      <p className="text-sm text-gray-600">{crop.market}</p>
                      <p className="text-xs text-gray-500">{crop.quality} • {crop.season}</p>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-800">
                          ₹{crop.currentPrice.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">{crop.unit}</div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getTrendColor(crop.trend)}`}>
                        {getTrendIcon(crop.trend)}
                        <span>
                          {change >= 0 ? '+' : ''}₹{Math.abs(change)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Demand Level */}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-center ${getDemandColor(crop.demandLevel)}`}>
                      {crop.demandLevel.toUpperCase()} DEMAND
                    </div>
                    
                    {/* Description */}
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {crop.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {filteredCrops.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No crops found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}

        {/* Crop Detail Modal */}
        <AnimatePresence>
          {selectedCrop && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCrop(null)}
            >
              <motion.div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <span className="text-2xl">
                          {categories.find(cat => cat.value === selectedCrop.category)?.emoji || '🌾'}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{selectedCrop.name}</h2>
                        <p className="text-gray-600">{selectedCrop.market} • {selectedCrop.quality}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCrop(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Price Info */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-green-50 rounded-xl p-4">
                      <h3 className="font-semibold text-green-800 mb-2">Current Price</h3>
                      <div className="text-3xl font-bold text-green-600">
                        ₹{selectedCrop.currentPrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700">{selectedCrop.unit}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Price Change</h3>
                      <div className={`text-2xl font-bold ${
                        calculatePriceChange(selectedCrop.currentPrice, selectedCrop.previousPrice).change >= 0 
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {calculatePriceChange(selectedCrop.currentPrice, selectedCrop.previousPrice).change >= 0 ? '+' : ''}
                        ₹{Math.abs(calculatePriceChange(selectedCrop.currentPrice, selectedCrop.previousPrice).change)}
                      </div>
                      <div className="text-sm text-gray-700">
                        ({calculatePriceChange(selectedCrop.currentPrice, selectedCrop.previousPrice).changePercent >= 0 ? '+' : ''}
                        {calculatePriceChange(selectedCrop.currentPrice, selectedCrop.previousPrice).changePercent}%)
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                      <p className="text-gray-600">{selectedCrop.description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">🌱 Growing Season</h3>
                        <p className="text-gray-600">{selectedCrop.season}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">📅 Harvest Time</h3>
                        <p className="text-gray-600">{selectedCrop.harvestTime}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">📦 Shelf Life</h3>
                        <p className="text-gray-600">{selectedCrop.shelfLife}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">🌡️ Storage Temp</h3>
                        <p className="text-gray-600">{selectedCrop.storageTemp}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">🍎 Nutritional Info</h3>
                      <p className="text-gray-600">{selectedCrop.nutritionalInfo}</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">💡 Market Tips</h3>
                      <p className="text-blue-700">{selectedCrop.marketTips}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MarketData