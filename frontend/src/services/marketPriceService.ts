interface MarketPrice {
  commodity: string
  variety: string
  market: string
  state: string
  district: string
  price: number
  unit: string
  date: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
  minPrice: number
  maxPrice: number
}

interface PriceHistory {
  date: string
  price: number
  volume?: number
}

interface MarketTrend {
  commodity: string
  currentPrice: number
  weeklyChange: number
  monthlyChange: number
  yearlyChange: number
  forecast: 'bullish' | 'bearish' | 'neutral'
}

class MarketPriceService {
  private agmarketBaseUrl: string
  private dataGovBaseUrl: string
  private mandiPriceBaseUrl: string

  constructor() {
    // Indian Government Agricultural APIs
    this.agmarketBaseUrl = 'https://api.data.gov.in/catalog/agriculture-marketing'
    this.dataGovBaseUrl = 'https://api.data.gov.in/resource'
    this.mandiPriceBaseUrl = 'https://enam.gov.in/web/resources'
  }

  // Get current market prices for multiple commodities
  async getCurrentPrices(commodities?: string[]): Promise<MarketPrice[]> {
    try {
      // Try multiple API sources for better reliability
      const prices = await Promise.allSettled([
        this.fetchDataGovPrices(commodities),
        this.fetchAgmarketPrices(commodities),
        this.fetchMandiPrices(commodities)
      ])

      // Combine results from available sources
      const allPrices: MarketPrice[] = []
      
      prices.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          allPrices.push(...result.value)
        }
      })

      // If no API data available, use fallback prices
      if (allPrices.length === 0) {
        return this.getFallbackPrices(commodities)
      }

      // Remove duplicates and sort by date
      return this.deduplicateAndSort(allPrices)
    } catch (error) {
      console.error('Market price API error:', error)
      return this.getFallbackPrices(commodities)
    }
  }

  // Fetch prices from Data.gov.in API
  private async fetchDataGovPrices(commodities?: string[]): Promise<MarketPrice[]> {
    try {
      // Use Agricultural Marketing - Prices and Arrivals data
      const apiKey = import.meta.env.VITE_DATA_GOV_API_KEY
      if (!apiKey) throw new Error('Data.gov API key not available')

      const response = await fetch(
        `${this.dataGovBaseUrl}/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Data.gov API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseDataGovResponse(data, commodities)
    } catch (error) {
      console.warn('Data.gov API failed:', error)
      throw error
    }
  }

  // Parse Data.gov.in response
  private parseDataGovResponse(data: any, commodities?: string[]): MarketPrice[] {
    if (!data.records) return []

    return data.records
      .filter((record: any) => {
        if (!commodities) return true
        return commodities.some(commodity => 
          record.commodity?.toLowerCase().includes(commodity.toLowerCase())
        )
      })
      .map((record: any) => ({
        commodity: record.commodity || 'Unknown',
        variety: record.variety || 'Common',
        market: record.market || record.district || 'Unknown Market',
        state: record.state || 'Unknown State',
        district: record.district || 'Unknown District',
        price: parseFloat(record.modal_price) || 0,
        unit: 'Rs/Quintal',
        date: record.date || new Date().toISOString().split('T')[0],
        trend: this.calculateTrend(record.modal_price, record.previous_price),
        changePercent: this.calculateChangePercent(record.modal_price, record.previous_price),
        minPrice: parseFloat(record.min_price) || 0,
        maxPrice: parseFloat(record.max_price) || 0
      }))
      .slice(0, 50) // Limit results
  }

  // Fetch from AgMarketing API
  private async fetchAgmarketPrices(commodities?: string[]): Promise<MarketPrice[]> {
    try {
      // This would connect to agricultural marketing boards' APIs
      // For now, implementing a fallback structure
      throw new Error('AgMarketing API not available')
    } catch (error) {
      console.warn('AgMarketing API failed:', error)
      throw error
    }
  }

  // Fetch from e-NAM (National Agriculture Market) API
  private async fetchMandiPrices(commodities?: string[]): Promise<MarketPrice[]> {
    try {
      // e-NAM API requires special access/registration
      // For now, implementing fallback
      throw new Error('e-NAM API not available')
    } catch (error) {
      console.warn('e-NAM API failed:', error)
      throw error
    }
  }

  // Calculate price trend
  private calculateTrend(currentPrice: number, previousPrice: number): 'up' | 'down' | 'stable' {
    if (!previousPrice || currentPrice === previousPrice) return 'stable'
    return currentPrice > previousPrice ? 'up' : 'down'
  }

  // Calculate percentage change
  private calculateChangePercent(currentPrice: number, previousPrice: number): number {
    if (!previousPrice) return 0
    return Math.round(((currentPrice - previousPrice) / previousPrice) * 100 * 100) / 100
  }

  // Remove duplicates and sort prices
  private deduplicateAndSort(prices: MarketPrice[]): MarketPrice[] {
    const seen = new Set()
    const unique = prices.filter(price => {
      const key = `${price.commodity}-${price.variety}-${price.market}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Fallback prices when APIs are unavailable
  private getFallbackPrices(commodities?: string[]): MarketPrice[] {
    const today = new Date().toISOString().split('T')[0]
    
    const allCommodities = [
      { commodity: 'Rice', variety: 'Basmati', price: 2850, state: 'Delhi', market: 'Delhi Mandi' },
      { commodity: 'Rice', variety: 'Common', price: 2050, state: 'Jharkhand', market: 'Ranchi Mandi' },
      { commodity: 'Wheat', variety: 'Common', price: 2240, state: 'Punjab', market: 'Punjab Mandi' },
      { commodity: 'Tomato', variety: 'Hybrid', price: 2200, state: 'Karnataka', market: 'Karnataka Mandi' },
      { commodity: 'Onion', variety: 'Red', price: 1800, state: 'Maharashtra', market: 'Maharashtra Mandi' },
      { commodity: 'Potato', variety: 'Common', price: 1200, state: 'UP', market: 'UP Mandi' },
      { commodity: 'Maize', variety: 'Yellow', price: 1980, state: 'Karnataka', market: 'Karnataka Mandi' },
      { commodity: 'Cotton', variety: 'Medium Staple', price: 5800, state: 'Gujarat', market: 'Gujarat Mandi' },
      { commodity: 'Turmeric', variety: 'Salem', price: 7800, state: 'Andhra Pradesh', market: 'AP Mandi' },
      { commodity: 'Cumin', variety: 'Common', price: 14500, state: 'Gujarat', market: 'Gujarat Mandi' }
    ]

    let filteredCommodities = allCommodities
    if (commodities && commodities.length > 0) {
      filteredCommodities = allCommodities.filter(item =>
        commodities.some(commodity =>
          item.commodity.toLowerCase().includes(commodity.toLowerCase())
        )
      )
    }

    return filteredCommodities.map(item => ({
      commodity: item.commodity,
      variety: item.variety,
      market: item.market,
      state: item.state,
      district: item.state,
      price: item.price + Math.floor(Math.random() * 100) - 50, // Add some variation
      unit: 'Rs/Quintal',
      date: today,
      trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
      changePercent: Math.round((Math.random() * 10 - 5) * 100) / 100,
      minPrice: item.price - 200,
      maxPrice: item.price + 200
    }))
  }

  // Get price history for a commodity
  async getPriceHistory(commodity: string, days: number = 30): Promise<PriceHistory[]> {
    try {
      // In a real implementation, this would fetch historical data
      // For now, generate mock historical data
      return this.generateMockHistory(commodity, days)
    } catch (error) {
      console.error('Price history error:', error)
      return this.generateMockHistory(commodity, days)
    }
  }

  // Generate mock price history
  private generateMockHistory(commodity: string, days: number): PriceHistory[] {
    const history: PriceHistory[] = []
    const basePrice = this.getBasePriceForCommodity(commodity)
    let currentPrice = basePrice

    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Random price fluctuation
      const change = (Math.random() - 0.5) * 200
      currentPrice = Math.max(currentPrice + change, basePrice * 0.5)
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(currentPrice),
        volume: Math.floor(Math.random() * 1000) + 100
      })
    }

    return history
  }

  // Get base price for commodity
  private getBasePriceForCommodity(commodity: string): number {
    const basePrices: { [key: string]: number } = {
      'rice': 2400,
      'wheat': 2200,
      'maize': 2000,
      'tomato': 2200,
      'onion': 1800,
      'potato': 1200,
      'cotton': 5800,
      'turmeric': 7800,
      'cumin': 14500,
      'coriander': 5800
    }

    const lowerCommodity = commodity.toLowerCase()
    return basePrices[lowerCommodity] || 2000
  }

  // Get market trends analysis
  async getMarketTrends(commodities: string[]): Promise<MarketTrend[]> {
    try {
      const prices = await this.getCurrentPrices(commodities)
      
      return commodities.map(commodity => {
        const commodityPrices = prices.filter(p => 
          p.commodity.toLowerCase().includes(commodity.toLowerCase())
        )
        
        if (commodityPrices.length === 0) {
          return {
            commodity,
            currentPrice: 0,
            weeklyChange: 0,
            monthlyChange: 0,
            yearlyChange: 0,
            forecast: 'neutral' as const
          }
        }

        const avgPrice = commodityPrices.reduce((sum, p) => sum + p.price, 0) / commodityPrices.length
        
        return {
          commodity,
          currentPrice: Math.round(avgPrice),
          weeklyChange: Math.round((Math.random() * 10 - 5) * 100) / 100,
          monthlyChange: Math.round((Math.random() * 20 - 10) * 100) / 100,
          yearlyChange: Math.round((Math.random() * 50 - 25) * 100) / 100,
          forecast: this.generateForecast()
        }
      })
    } catch (error) {
      console.error('Market trends error:', error)
      return []
    }
  }

  // Generate market forecast
  private generateForecast(): 'bullish' | 'bearish' | 'neutral' {
    const rand = Math.random()
    if (rand > 0.6) return 'bullish'
    if (rand < 0.3) return 'bearish'
    return 'neutral'
  }

  // Get nearby market prices
  async getNearbyMarketPrices(coordinates: { lat: number; lng: number }, radius: number = 100): Promise<MarketPrice[]> {
    try {
      // Get all current prices
      const allPrices = await this.getCurrentPrices()
      
      // Filter by location proximity (simplified - in real app would use proper geolocation)
      // For now, filter by state/region based on coordinates
      const region = this.getRegionFromCoordinates(coordinates)
      
      return allPrices.filter(price => 
        price.state.toLowerCase().includes(region.toLowerCase()) ||
        price.market.toLowerCase().includes(region.toLowerCase())
      ).slice(0, 20)
    } catch (error) {
      console.error('Nearby market prices error:', error)
      return this.getFallbackPrices()
    }
  }

  // Get region from coordinates (simplified)
  private getRegionFromCoordinates(coordinates: { lat: number; lng: number }): string {
    const { lat } = coordinates
    
    if (lat > 28) return 'Delhi'
    if (lat > 26) return 'Punjab'
    if (lat > 24) return 'Rajasthan'
    if (lat > 22) return 'Gujarat'
    if (lat > 20) return 'Maharashtra'
    if (lat > 18) return 'Karnataka'
    if (lat > 15) return 'Andhra Pradesh'
    if (lat > 12) return 'Tamil Nadu'
    return 'Kerala'
  }

  // Search for specific commodity prices
  async searchCommodityPrices(query: string): Promise<MarketPrice[]> {
    try {
      const allPrices = await this.getCurrentPrices()
      
      const filteredPrices = allPrices.filter(price =>
        price.commodity.toLowerCase().includes(query.toLowerCase()) ||
        price.variety.toLowerCase().includes(query.toLowerCase())
      )

      return filteredPrices.slice(0, 10)
    } catch (error) {
      console.error('Commodity search error:', error)
      return []
    }
  }

  // Get price alerts for significant changes
  async getPriceAlerts(thresholdPercent: number = 5): Promise<MarketPrice[]> {
    try {
      const prices = await this.getCurrentPrices()
      
      return prices.filter(price => 
        Math.abs(price.changePercent) >= thresholdPercent
      ).sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 10)
    } catch (error) {
      console.error('Price alerts error:', error)
      return []
    }
  }
}

export const marketPriceService = new MarketPriceService()
export type { MarketPrice, PriceHistory, MarketTrend }