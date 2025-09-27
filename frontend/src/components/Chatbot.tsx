import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PaperAirplaneIcon,
  XMarkIcon,
  SparklesIcon,
  UserIcon,
  ComputerDesktopIcon,
  MicrophoneIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  message: string
  timestamp: Date
  isLoading?: boolean
}

interface ChatbotProps {
  isOpen: boolean
  onToggle: () => void
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: `🌾 **Namaste! I'm CropAI Assistant**

Welcome to your personal agricultural expert! I can help you with:

• **Crop Recommendations** - Best crops for your soil and season
• **Disease Identification** - Plant disease diagnosis and treatment
• **Weather Insights** - Agricultural weather forecasts
• **Market Prices** - Current crop prices and selling advice
• **Farming Techniques** - Modern farming practices
• **Soil Management** - Soil health and fertilizer guidance
• **Pest Control** - Organic and chemical pest solutions
• **Government Schemes** - Agricultural subsidies and programs

Ask me anything about farming in Jharkhand! 🌱`,
      timestamp: new Date()
    }
  ])
  
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sample intelligent responses for agricultural queries
  const getSmartResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    
    // Crop recommendation queries
    if (lowerQuery.includes('crop') && (lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('best'))) {
      return `🌾 **Smart Crop Recommendations for Jharkhand:**

**For Current Season (Kharif):**
• **Rice (Paddy)** - High demand, government MSP support
• **Maize** - Good market price, drought tolerant  
• **Sugarcane** - Long-term investment, stable returns
• **Vegetables** - Quick returns, local market demand

**Key Factors to Consider:**
• **Soil Type** - Clay soil best for rice, loamy for vegetables
• **Water Availability** - Rice needs more water than maize
• **Market Distance** - Perishable crops need nearby markets
• **Investment Capacity** - Rice requires higher initial investment

**Pro Tips:**
• Check soil pH before selecting crops
• Consider crop rotation for soil health
• Mix cash crops with food crops for stability

Would you like specific recommendations based on your location and soil type?`
    }

    // Disease-related queries
    if (lowerQuery.includes('disease') || lowerQuery.includes('pest') || lowerQuery.includes('fungus') || lowerQuery.includes('insect')) {
      return `🔬 **Plant Disease & Pest Management Guide:**

**Common Diseases in Jharkhand:**
• **Blast Disease (Rice)** - Brown spots on leaves, affects yield
• **Late Blight (Potato/Tomato)** - Dark patches, spreads quickly
• **Stem Rot** - Affects multiple crops, caused by excess moisture
• **Leaf Curl** - Viral infection, transmitted by whiteflies

**Immediate Actions:**
• **Isolate** affected plants immediately
• **Remove** infected leaves and destroy them
• **Improve** air circulation around plants
• **Avoid** overhead watering

**Treatment Options:**
• **Organic**: Neem oil, copper sulfate, bio-fungicides
• **Chemical**: Mancozeb, Carbendazim (as per expert advice)
• **Preventive**: Bordeaux mixture spray

**Long-term Prevention:**
• Use resistant crop varieties
• Proper crop rotation
• Maintain field hygiene
• Regular monitoring

Upload a photo of affected plants for specific diagnosis!`
    }

    // Weather-related queries
    if (lowerQuery.includes('weather') || lowerQuery.includes('rain') || lowerQuery.includes('temperature') || lowerQuery.includes('climate')) {
      return `🌤️ **Agricultural Weather Insights for Jharkhand:**

**Current Weather Impact:**
• **Monsoon Season** - Good for Kharif crops like rice, maize
• **Temperature Range** - 25-35°C suitable for most crops
• **Humidity Levels** - High humidity increases disease risk
• **Rainfall Pattern** - Monitor for flooding or drought stress

**Farming Activities by Weather:**
• **Sunny Days** - Perfect for spraying pesticides, harvesting
• **Rainy Days** - Avoid field operations, check drainage
• **Cloudy Weather** - Good for transplanting seedlings
• **Windy Conditions** - Be cautious with chemical sprays

**Weather-Based Recommendations:**
• **Heavy Rain Alert** - Ensure proper field drainage
• **Dry Spell** - Increase irrigation frequency
• **Storm Warning** - Support tall crops, harvest if ready
• **Hail Risk** - Use protective covers for sensitive crops

**Smart Tips:**
• Check weather forecast daily
• Plan operations 3-4 days ahead
• Keep emergency supplies ready
• Use weather apps for accurate forecasts

Check our Weather section for 5-day detailed forecasts!`
    }

    // Market price queries
    if (lowerQuery.includes('price') || lowerQuery.includes('market') || lowerQuery.includes('sell') || lowerQuery.includes('profit')) {
      return `📈 **Market Intelligence & Pricing Insights:**

**Current Market Trends (Jharkhand):**
• **Rice** - ₹2,850/quintal (↑ 4.8% from last week)
• **Wheat** - ₹2,340/quintal (↓ 1.7% from last week)
• **Maize** - ₹2,180/quintal (↑ 1.4% from last week)
• **Potato** - ₹1,580/quintal (↓ 8.1% due to supply increase)

**Best Selling Strategies:**
• **Rice** - Sell within next 2 weeks, prices at seasonal high
• **Vegetables** - Sell immediately, monsoon affecting transport
• **Grains** - Hold for 3-4 weeks, prices expected to rise
• **Cash Crops** - Check futures market for timing

**Factors Affecting Prices:**
• **Festival Season** - Increases demand for rice, wheat
• **Transport Issues** - Affects perishable crop prices
• **Government Policies** - MSP announcements impact decisions
• **Export Demand** - International markets influence prices

**Maximizing Profits:**
• Grade your produce properly
• Use proper storage techniques
• Sell directly to eliminate middlemen
• Form farmer groups for better rates

Visit our Market Data section for real-time prices!`
    }

    // Soil-related queries
    if (lowerQuery.includes('soil') || lowerQuery.includes('fertilizer') || lowerQuery.includes('nutrient') || lowerQuery.includes('ph')) {
      return `🌱 **Soil Health & Nutrient Management:**

**Soil Types in Jharkhand:**
• **Red Soil** - Good for rice, needs organic matter
• **Black Soil** - Excellent for cotton, wheat, sugarcane
• **Laterite Soil** - Suitable for cashew, coconut with amendments
• **Alluvial Soil** - Best for vegetables, highly fertile

**Essential Soil Tests:**
• **pH Level** - Ideal range 6.0-7.5 for most crops
• **Nitrogen (N)** - For leaf growth and green color
• **Phosphorus (P)** - For root development and flowering  
• **Potassium (K)** - For disease resistance and fruit quality

**Natural Soil Improvement:**
• **Compost** - Add 2-3 tons per acre annually
• **Green Manuring** - Grow legumes and incorporate
• **Crop Rotation** - Alternate between different crop families
• **Cover Crops** - Prevent soil erosion during off-season

**Fertilizer Recommendations:**
• **Organic**: FYM, compost, vermicompost
• **Bio-fertilizers**: Rhizobium, PSB, Azotobacter
• **Chemical**: NPK based on soil test reports
• **Micro-nutrients**: Zinc, Iron, Boron as needed

Get your soil tested every 2-3 years for optimal results!`
    }

    // Government schemes queries
    if (lowerQuery.includes('scheme') || lowerQuery.includes('subsidy') || lowerQuery.includes('government') || lowerQuery.includes('loan')) {
      return `🏛️ **Government Schemes for Jharkhand Farmers:**

**Central Government Schemes:**
• **PM-KISAN** - ₹6,000 per year direct cash transfer
• **Crop Insurance** - Pradhan Mantri Fasal Bima Yojana
• **Soil Health Card** - Free soil testing and recommendations
• **KCC (Kisan Credit Card)** - Easy agricultural loans

**Jharkhand State Schemes:**
• **Birsa Kisan Yojana** - Financial assistance for farming
• **Mukhyamantri Krishi Ashirwad Yojana** - Input subsidies
• **Organic Farming Promotion** - Certification support
• **Water Conservation** - Drip irrigation subsidies

**How to Apply:**
• **Online Portal** - jharkhand.gov.in
• **Common Service Centers** - Visit nearest CSC
• **Agricultural Department** - Block office applications
• **Bank Branches** - For loan-related schemes

**Required Documents:**
• Aadhaar Card and linking
• Land documents (Khasra/Khatauni)
• Bank account details
• Caste certificate (if applicable)

**Application Status:**
• Track applications online
• SMS updates on mobile
• Visit concerned office for queries

Need help with specific scheme applications? Ask me!`
    }

    // Organic farming queries
    if (lowerQuery.includes('organic') || lowerQuery.includes('natural') || lowerQuery.includes('chemical free')) {
      return `🌿 **Organic Farming Guide for Jharkhand:**

**Benefits of Organic Farming:**
• **Health** - No harmful chemical residues
• **Environment** - Protects soil and water quality
• **Economics** - Premium prices (20-30% higher)
• **Sustainability** - Long-term soil fertility

**Organic Inputs Available:**
• **FYM (Farmyard Manure)** - Base fertilizer, 10-15 tons/acre
• **Vermicompost** - Rich in nutrients, 2-3 tons/acre
• **Bio-fertilizers** - Nitrogen fixation, phosphorus mobilization
• **Neem Products** - Natural pest control, disease prevention

**Organic Pest Management:**
• **Neem Oil** - Effective against aphids, thrips
• **Bacillus thuringiensis** - Biological control for caterpillars
• **Sticky Traps** - Yellow/blue traps for flying insects
• **Companion Planting** - Marigold, mint for natural repelling

**Certification Process:**
• **Inspection** - Field verification by certified agency
• **Documentation** - Maintain detailed records
• **Transition Period** - 3 years for full organic status
• **Cost** - ₹15,000-25,000 for certification

**Market Linkages:**
• Organic stores and supermarkets
• Online platforms (Amazon, Flipkart)
• Export opportunities
• Direct consumer sales

Start with small area and gradually expand your organic farming!`
    }

    // Water management queries  
    if (lowerQuery.includes('water') || lowerQuery.includes('irrigation') || lowerQuery.includes('drought') || lowerQuery.includes('drip')) {
      return `💧 **Smart Water Management for Agriculture:**

**Efficient Irrigation Methods:**
• **Drip Irrigation** - 40-50% water saving, uniform distribution
• **Sprinkler System** - Good for field crops, 20-30% water saving
• **Micro-sprinklers** - Perfect for fruit trees and vegetables
• **Furrow Irrigation** - Traditional but effective for row crops

**Water Conservation Techniques:**
• **Mulching** - Reduces evaporation by 50-70%
• **Rainwater Harvesting** - Collect and store monsoon water
• **Check Dams** - Control water flow, increase groundwater
• **Contour Farming** - Prevents water runoff on slopes

**Drought Management:**
• **Drought-tolerant Varieties** - Choose crops that need less water
• **Deficit Irrigation** - Apply less water at non-critical stages
• **Crop Selection** - Prefer millets over rice during dry years
• **Soil Moisture Conservation** - Deep plowing, organic matter addition

**Government Support:**
• **Subsidy on Drip/Sprinkler** - 50-90% subsidy available
• **Bore Well Subsidy** - Financial assistance for water sources
• **Pond Construction** - Support for farm ponds
• **Training Programs** - Free workshops on water management

**Water Quality Testing:**
• Check pH (6.5-8.5 ideal)
• Test for salinity and minerals
• Avoid contaminated water sources
• Regular cleaning of water systems

Smart water use = Higher yields + Lower costs!`
    }

    // General farming queries
    if (lowerQuery.includes('farming') || lowerQuery.includes('agriculture') || lowerQuery.includes('crop') || lowerQuery.includes('help')) {
      return `🚜 **Complete Farming Guide for Jharkhand:**

**Getting Started:**
• **Land Preparation** - Deep plowing, leveling, organic matter addition
• **Seed Selection** - Use certified seeds from authorized dealers
• **Timing** - Follow agricultural calendar for your region
• **Investment Planning** - Budget for inputs, labor, equipment

**Modern Farming Techniques:**
• **Precision Agriculture** - GPS-guided farming, variable rate application
• **Protected Cultivation** - Polyhouse, shade net farming
• **Mechanization** - Tractors, harvesters, seeders for efficiency
• **Digital Tools** - Weather apps, market price apps, expert consultation

**Seasonal Activities:**
• **Kharif Season** (Jun-Oct) - Rice, maize, sugarcane, vegetables
• **Rabi Season** (Nov-Apr) - Wheat, mustard, gram, peas
• **Zaid Season** (Apr-Jun) - Fodder crops, summer vegetables

**Success Factors:**
• **Knowledge** - Stay updated with latest techniques
• **Quality Inputs** - Invest in good seeds, fertilizers
• **Timely Operations** - Follow critical timing for operations
• **Market Intelligence** - Know when and where to sell

**Common Mistakes to Avoid:**
• Over-use of chemicals
• Ignoring soil health
• Poor water management
• Lack of proper storage

**Support Systems:**
• Agricultural extension officers
• Krishi Vigyan Kendras (KVKs)
• Farmer Producer Organizations (FPOs)
• Online resources and apps

Remember: Successful farming = Right crop + Right time + Right technique!`
    }

    // Default intelligent response
    return `🤖 **I understand you're asking about "${query}"**

I'm here to help with all your agricultural questions! Here are some topics I can assist you with:

**🌾 Crop Management:**
• Best crop selection for your area
• Seasonal farming calendar
• Crop rotation strategies

**🔬 Plant Health:**
• Disease identification and treatment
• Pest control methods
• Preventive care tips

**💧 Resource Management:**
• Irrigation and water conservation
• Soil health improvement
• Fertilizer recommendations

**📈 Business Intelligence:**
• Market prices and trends
• Best selling strategies
• Profit maximization tips

**🏛️ Government Support:**
• Available schemes and subsidies
• Application procedures
• Required documentation

**Could you please be more specific about what you'd like to know?** For example:
- "What crops should I grow in monsoon?"
- "How to treat rice blast disease?"
- "What's the current price of wheat?"
- "Which government schemes can I apply for?"

I'm here to provide detailed, actionable advice! 🌱`
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate API call to backend
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: getSmartResponse(userMessage.message),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      toast.error('Sorry, I encountered an error. Please try again.')
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    "What crops should I grow this season?",
    "How to identify plant diseases?",
    "Current market prices?",
    "Government schemes for farmers?",
    "Organic farming tips?"
  ]

  const formatMessage = (message: string) => {
    // Convert markdown-style formatting to HTML
    let formatted = message
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
    
    return { __html: formatted }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-green-200 z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">CropAI Assistant</h3>
            <p className="text-green-100 text-sm">Agricultural Expert</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.type === 'user' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
              <div className="flex items-start space-x-2">
                {message.type === 'bot' && (
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ComputerDesktopIcon className="w-4 h-4 text-green-600" />
                  </div>
                )}
                <div className="flex-1">
                  <div 
                    className={`text-sm leading-relaxed ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}
                    dangerouslySetInnerHTML={formatMessage(message.message)}
                  />
                  <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-green-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.type === 'user' && (
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <ComputerDesktopIcon className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-3 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-600 mb-2">Quick Questions:</p>
          <div className="flex flex-wrap gap-1">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputValue(question)}
                className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about farming, crops, diseases..."
              className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 text-sm"
              disabled={isTyping}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                <MicrophoneIcon className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                <PhotoIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={`p-2 rounded-xl transition-colors ${
              inputValue.trim() && !isTyping
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default Chatbot