interface SoilData {
  ph: number
  nitrogen: number
  phosphorus: number
  potassium: number
  organicCarbon?: number
  organicMatter?: number
  soilType: string
  soilClass?: string
  drainage?: string
  fertility: 'Low' | 'Medium' | 'High'
  moisture?: number
  recommendations?: string[]
}

interface SoilProperties {
  bulkDensity: number
  clayContent: number
  sandContent: number
  siltContent: number
  soilTexture: string
}

class SoilService {
  private soilGridsBaseUrl: string
  private nasaPowerBaseUrl: string

  constructor() {
    this.soilGridsBaseUrl = 'https://rest.isric.org/soilgrids/v2.0'
    this.nasaPowerBaseUrl = 'https://power.larc.nasa.gov/api/temporal'
  }

  // Get comprehensive soil data from SoilGrids
  async getSoilData(lat: number, lon: number): Promise<SoilData> {
    try {
      const soilProperties = await this.fetchSoilGridsData(lat, lon)
      const climateData = await this.fetchNASAClimateData(lat, lon)
      
      return this.processSoilData(soilProperties, climateData, lat, lon)
    } catch (error) {
      console.error('Soil API Error:', error)
      // Fallback to regional soil data estimation
      return this.getFallbackSoilData(lat, lon)
    }
  }

  // Fetch data from SoilGrids API
  private async fetchSoilGridsData(lat: number, lon: number) {
    const properties = [
      'phh2o', // pH in H2O
      'nitrogen', // Total nitrogen
      'phosav', // Available phosphorus  
      'potassium', // Exchangeable potassium
      'ocd', // Organic carbon density
      'bdod', // Bulk density
      'clay', // Clay content
      'sand', // Sand content
      'silt' // Silt content
    ]

    const depths = ['0-5cm', '5-15cm'] // Surface soil layers
    
    try {
      const response = await fetch(
        `${this.soilGridsBaseUrl}/properties/query?lon=${lon}&lat=${lat}&property=${properties.join(',')}&depth=${depths.join(',')}&value=mean`
      )

      if (!response.ok) {
        throw new Error(`SoilGrids API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('SoilGrids API Error:', error)
      throw error
    }
  }

  // Fetch climate data from NASA POWER for soil analysis
  private async fetchNASAClimateData(lat: number, lon: number) {
    const parameters = 'T2M,PRECTOTCORR,RH2M' // Temperature, Precipitation, Humidity
    const start = new Date().getFullYear() - 1 // Last year
    const end = new Date().getFullYear()

    try {
      const response = await fetch(
        `${this.nasaPowerBaseUrl}/climatology/point?start=${start}&end=${end}&latitude=${lat}&longitude=${lon}&community=AG&parameters=${parameters}&format=json`
      )

      if (!response.ok) {
        throw new Error(`NASA POWER API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.warn('NASA POWER API Error:', error)
      return null // Continue without climate data
    }
  }

  // Process and normalize soil data
  private processSoilData(soilGridsData: any, climateData: any, lat: number, lon: number): SoilData {
    // Extract soil properties from SoilGrids response
    const properties = soilGridsData.properties || {}
    
    // Get surface layer data (0-5cm)
    const surfaceLayer = '0-5cm'
    
    // pH (convert from SoilGrids units)
    const ph = this.extractSoilValue(properties.phh2o, surfaceLayer) / 10 || 6.5
    
    // Nitrogen (mg/kg converted to kg/ha)
    const nitrogen = this.extractSoilValue(properties.nitrogen, surfaceLayer) || 200
    
    // Phosphorus (mg/kg)
    const phosphorus = this.extractSoilValue(properties.phosav, surfaceLayer) || 25
    
    // Potassium (cmol/kg converted to kg/ha)
    const potassium = this.extractSoilValue(properties.potassium, surfaceLayer) * 39.1 || 150
    
    // Organic carbon (g/kg)
    const organicCarbon = this.extractSoilValue(properties.ocd, surfaceLayer) / 10 || 15
    
    // Soil texture analysis
    const clay = this.extractSoilValue(properties.clay, surfaceLayer) || 25
    const sand = this.extractSoilValue(properties.sand, surfaceLayer) || 45
    const silt = this.extractSoilValue(properties.silt, surfaceLayer) || 30
    
    const soilTexture = this.determineSoilTexture(clay, sand, silt)
    const soilType = this.determineSoilType(soilTexture, lat, lon)
    const fertility = this.assessFertility(nitrogen, phosphorus, potassium, organicCarbon)
    const recommendations = this.generateRecommendations(ph, nitrogen, phosphorus, potassium, fertility)

    return {
      ph: Math.round(ph * 10) / 10,
      nitrogen: Math.round(nitrogen),
      phosphorus: Math.round(phosphorus),
      potassium: Math.round(potassium),
      organicCarbon: Math.round(organicCarbon * 10) / 10,
      soilType,
      soilClass: soilTexture,
      drainage: this.assessDrainage(clay, sand),
      fertility,
      recommendations
    }
  }

  // Extract value from SoilGrids response structure
  private extractSoilValue(property: any, depth: string): number {
    if (!property || !property.depths) return 0
    
    const depthData = property.depths.find((d: any) => d.label === depth)
    return depthData ? depthData.values.mean : 0
  }

  // Determine soil texture based on clay, sand, silt percentages
  private determineSoilTexture(clay: number, sand: number, silt: number): string {
    if (clay > 40) return 'Clay'
    if (sand > 70) return 'Sandy'
    if (silt > 50) return 'Silty'
    if (clay > 27 && sand > 20 && sand < 45) return 'Clay Loam'
    if (clay < 27 && sand > 52) return 'Sandy Loam'
    if (clay < 27 && silt > 28 && sand < 52) return 'Silty Loam'
    return 'Loam'
  }

  // Determine soil type based on location and texture
  private determineSoilType(texture: string, lat: number, lon: number): string {
    // Indian soil type classification based on region
    if (lat > 26) { // Northern India
      return texture.includes('Clay') ? 'Alluvial Soil' : 'Sandy Loam'
    } else if (lat > 20) { // Central India  
      return texture.includes('Clay') ? 'Black Soil (Regur)' : 'Mixed Red and Black Soil'
    } else { // Southern India
      return texture.includes('Sand') ? 'Red Sandy Soil' : 'Red Soil'
    }
  }

  // Assess soil fertility
  private assessFertility(n: number, p: number, k: number, oc: number): 'Low' | 'Medium' | 'High' {
    let score = 0
    
    // Nitrogen scoring
    if (n > 300) score += 2
    else if (n > 200) score += 1
    
    // Phosphorus scoring  
    if (p > 30) score += 2
    else if (p > 15) score += 1
    
    // Potassium scoring
    if (k > 200) score += 2
    else if (k > 100) score += 1
    
    // Organic carbon scoring
    if (oc > 20) score += 2
    else if (oc > 10) score += 1

    if (score >= 6) return 'High'
    if (score >= 3) return 'Medium'
    return 'Low'
  }

  // Assess drainage based on clay/sand content
  private assessDrainage(clay: number, sand: number): string {
    if (clay > 40) return 'Poor drainage'
    if (sand > 70) return 'Excellent drainage'
    if (sand > 50) return 'Good drainage'
    return 'Moderate drainage'
  }

  // Generate soil management recommendations
  private generateRecommendations(ph: number, n: number, p: number, k: number, fertility: string): string[] {
    const recommendations: string[] = []

    // pH recommendations
    if (ph < 6.0) {
      recommendations.push('Apply lime to increase soil pH for better nutrient availability')
    } else if (ph > 8.0) {
      recommendations.push('Apply sulfur or organic matter to reduce soil pH')
    }

    // Nutrient recommendations
    if (n < 200) {
      recommendations.push('Increase nitrogen through urea or organic manure application')
    }
    if (p < 20) {
      recommendations.push('Apply phosphorus fertilizer (DAP) for better root development')
    }
    if (k < 120) {
      recommendations.push('Add potassium fertilizer (MOP) for improved plant health')
    }

    // General recommendations based on fertility
    if (fertility === 'Low') {
      recommendations.push('Apply compost and organic matter to improve soil structure')
      recommendations.push('Consider green manuring with legumes to boost nitrogen')
    }

    if (recommendations.length === 0) {
      recommendations.push('Soil conditions are good - maintain with balanced fertilization')
    }

    return recommendations.slice(0, 4) // Limit to 4 recommendations
  }

  // Fallback soil data when APIs are unavailable
  private getFallbackSoilData(lat: number, lon: number): SoilData {
    // Regional soil estimates for India
    let soilType = 'Loamy'
    let ph = 6.5
    let nitrogen = 250
    let phosphorus = 25
    let potassium = 180

    // Northern India (Indo-Gangetic plains)
    if (lat > 26) {
      soilType = 'Alluvial Soil'
      ph = 7.2
      nitrogen = 280
      phosphorus = 30
      potassium = 200
    }
    // Central India (Deccan plateau)
    else if (lat > 20) {
      soilType = 'Black Soil (Regur)'
      ph = 7.8
      nitrogen = 220
      phosphorus = 20
      potassium = 150
    }
    // Southern India
    else {
      soilType = 'Red Soil'
      ph = 6.2
      nitrogen = 200
      phosphorus = 18
      potassium = 140
    }

    return {
      ph,
      nitrogen,
      phosphorus, 
      potassium,
      organicCarbon: 15,
      soilType,
      soilClass: 'Loam',
      drainage: 'Good drainage',
      fertility: 'Medium',
      recommendations: [
        'Apply balanced NPK fertilizer as per soil test',
        'Add organic compost to improve soil health',
        'Maintain proper crop rotation for soil fertility'
      ]
    }
  }

  // Get soil suitability for specific crops
  async getCropSuitability(lat: number, lon: number, cropType: string): Promise<{
    suitability: 'Excellent' | 'Good' | 'Fair' | 'Poor'
    score: number
    factors: string[]
  }> {
    try {
      const soilData = await this.getSoilData(lat, lon)
      return this.assessCropSuitability(soilData, cropType)
    } catch (error) {
      console.error('Crop suitability error:', error)
      return {
        suitability: 'Fair',
        score: 60,
        factors: ['Unable to assess - using regional estimates']
      }
    }
  }

  // Assess how suitable soil is for specific crop
  private assessCropSuitability(soilData: SoilData, cropType: string): {
    suitability: 'Excellent' | 'Good' | 'Fair' | 'Poor'
    score: number
    factors: string[]
  } {
    let score = 0
    const factors: string[] = []

    // Crop-specific soil requirements
    const cropRequirements = {
      rice: { phMin: 5.5, phMax: 7.0, nMin: 200, pMin: 20, kMin: 150 },
      wheat: { phMin: 6.0, phMax: 7.5, nMin: 180, pMin: 25, kMin: 120 },
      tomato: { phMin: 6.0, phMax: 6.8, nMin: 250, pMin: 30, kMin: 200 },
      cotton: { phMin: 5.8, phMax: 8.0, nMin: 200, pMin: 25, kMin: 150 }
    }

    const requirements = cropRequirements[cropType.toLowerCase() as keyof typeof cropRequirements] || cropRequirements.rice

    // pH suitability
    if (soilData.ph >= requirements.phMin && soilData.ph <= requirements.phMax) {
      score += 25
      factors.push('pH level is optimal for this crop')
    } else {
      factors.push(`pH needs adjustment (current: ${soilData.ph})`)
    }

    // Nutrient suitability
    if (soilData.nitrogen >= requirements.nMin) {
      score += 25
      factors.push('Nitrogen levels are adequate')
    } else {
      factors.push('Nitrogen supplementation needed')
    }

    if (soilData.phosphorus >= requirements.pMin) {
      score += 25
      factors.push('Phosphorus levels are sufficient')
    } else {
      factors.push('Phosphorus fertilizer recommended')
    }

    if (soilData.potassium >= requirements.kMin) {
      score += 25
      factors.push('Potassium levels are good')
    } else {
      factors.push('Potassium enhancement needed')
    }

    // Determine suitability
    let suitability: 'Excellent' | 'Good' | 'Fair' | 'Poor'
    if (score >= 90) suitability = 'Excellent'
    else if (score >= 70) suitability = 'Good'
    else if (score >= 50) suitability = 'Fair'
    else suitability = 'Poor'

    return { suitability, score, factors }
  }
}

export const soilService = new SoilService()
export type { SoilData, SoilProperties }