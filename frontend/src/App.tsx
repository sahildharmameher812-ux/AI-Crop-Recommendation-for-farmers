import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Layout Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatbotButton from './components/ChatbotButton'

// Page Components
import Home from './pages/Home'
import AIAssistant from './pages/AIAssistant'
import CropRecommendation from './pages/CropRecommendation'
import DiseaseDetection from './pages/DiseaseDetection'
import WeatherForecast from './pages/WeatherForecast'
import MarketData from './pages/MarketData'
import About from './pages/About'
import Contact from './pages/Contact'

// Error Boundary Component
import ErrorBoundary from './components/ErrorBoundary'

const App: React.FC = () => {
  const location = useLocation()
  
  // Don't show floating chatbot on the AI Assistant page since it has full-page chat
  const shouldShowFloatingChatbot = location.pathname !== '/ai-assistant'
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Navbar />
        
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/crop-recommendation" element={<CropRecommendation />} />
                <Route path="/disease-detection" element={<DiseaseDetection />} />
                <Route path="/weather" element={<WeatherForecast />} />
                <Route path="/market-data" element={<MarketData />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        
        <Footer />
        
        {/* Floating Chatbot - only show on pages other than AI Assistant */}
        {shouldShowFloatingChatbot && <ChatbotButton />}
      </div>
    </ErrorBoundary>
  )
}

export default App