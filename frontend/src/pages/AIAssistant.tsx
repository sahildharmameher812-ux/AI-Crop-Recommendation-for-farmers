import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PaperAirplaneIcon,
  SparklesIcon,
  UserIcon,
  ComputerDesktopIcon,
  MicrophoneIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import axios from 'axios'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  message: string
  timestamp: Date
  isLoading?: boolean
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: `🌾 **Welcome to CropAI Smart Assistant!**

I'm your AI-powered agricultural expert, ready to help you with:

• **🌱 Crop Recommendations** - Best crops for your soil and climate
• **🔬 Disease Management** - Plant health diagnostics and solutions  
• **🌤️ Weather Insights** - Agricultural weather forecasting
• **📈 Market Intelligence** - Current prices and selling strategies
• **🌿 Sustainable Farming** - Organic and eco-friendly practices
• **💧 Water Management** - Irrigation optimization tips
• **🏛️ Government Schemes** - Agricultural subsidies and programs
• **📊 Farm Analytics** - Data-driven farming insights

**✨ Powered by Advanced AI:**
✅ ChatGPT-like intelligent responses
✅ Context-aware conversations
✅ Real-time agricultural data
✅ Personalized recommendations
✅ Multi-language support

Ask me anything about farming! I'm here to help you succeed. 🚜`,
      timestamp: new Date()
    }
  ])
  
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize session ID on component mount
  useEffect(() => {
    if (!sessionId) {
      setSessionId('session_' + Math.random().toString(36).substr(2, 9))
    }
  }, [])

  // Backend API call for intelligent responses
  const getChatbotResponse = async (query: string): Promise<string> => {
    try {
      const response = await axios.post('http://localhost:8000/chatbot', {
        message: query,
        session_id: sessionId,
        language: 'en'
      })
      
      return response.data.reply
    } catch (error) {
      console.error('Error calling chatbot API:', error)
      // Fallback response if API fails
      return `🤖 I'm experiencing some technical difficulties right now. Please try again in a moment.
      
In the meantime, I can help you with:
• Crop recommendations and planning
• Plant disease identification
• Weather-based farming advice  
• Market prices and selling strategies
• Soil health and fertilization
• Sustainable farming practices
      
Feel free to ask your question again! 🌱`
    }
  }


  const scrollToBottom = () => {
    // Scroll within the chat messages container only
    const messagesContainer = messagesEndRef.current?.parentElement
    if (messagesContainer && messagesEndRef.current) {
      // Scroll the messages container, not the entire page
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  useEffect(() => {
    // Auto-scroll for new messages
    if (messages.length > 1) {
      // Use a slight delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom()
      }, 50)
    }
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentQuery = inputValue.trim()
    setInputValue('')
    setIsTyping(true)
    
    // Maintain focus on textarea to prevent jumping
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 0)

    try {
      // Call the actual OpenAI API through our backend
      const aiResponse = await getChatbotResponse(currentQuery)
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      toast.error('Sorry, I encountered an error. Please try again.')
    } finally {
      setIsTyping(false)
      // Ensure focus stays on textarea after response
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          // Ensure cursor is at the end
          inputRef.current.setSelectionRange(0, 0)
        }
      }, 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      
      // Store reference to textarea
      const textarea = e.currentTarget
      
      // Send message
      handleSendMessage()
      
      // Immediately refocus textarea to prevent focus jumping
      setTimeout(() => {
        textarea.focus()
        // Ensure cursor stays at end
        textarea.setSelectionRange(textarea.value.length, textarea.value.length)
      }, 10)
    }
  }

  const quickQuestions = [
    "What are the best crops for this season?",
    "How can I identify and treat plant diseases?",
    "What are the current market prices?",
    "Which government schemes can I apply for?",
    "How do I improve my soil health?",
    "What are the weather predictions for farming?",
    "How can I start organic farming?",
    "Which irrigation method is most efficient?"
  ]

  const formatMessage = (message: string) => {
    // Convert markdown-style formatting to HTML
    let formatted = message
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
    
    return { __html: formatted }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Full Screen Chat Interface */}
      <div className="container mx-auto px-4 py-4 h-screen">
        <div className="h-full bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] md:max-w-[75%] ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                      : 'bg-white border border-gray-200 shadow-sm'
                  } rounded-2xl p-4 md:p-6`}>
                    <div className="flex items-start space-x-3">
                      {message.type === 'bot' && (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <ComputerDesktopIcon className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div 
                          className={`leading-relaxed ${
                            message.type === 'user' ? 'text-white' : 'text-gray-800'
                          }`}
                          dangerouslySetInnerHTML={formatMessage(message.message)}
                        />
                        <div className={`text-xs mt-3 ${
                          message.type === 'user' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                      {message.type === 'user' && (
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ComputerDesktopIcon className="w-5 h-5 text-green-600" />
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
            <motion.div 
              className="border-t border-gray-200 bg-white p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <p className="text-sm text-gray-600 mb-3 font-medium">💡 Quick Questions to Get Started:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {quickQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setInputValue(question)}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-800 px-3 py-2 rounded-full border border-green-200 transition-all duration-200 hover:shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about farming, crops, diseases, market prices, government schemes, or sustainable agriculture..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none"
                  rows={2}
                  disabled={isTyping}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50">
                      <MicrophoneIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50">
                      <PhotoIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Press Enter + Shift for new line, Enter to send
                  </div>
                </div>
              </div>
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  inputValue.trim() && !isTyping
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={{ scale: inputValue.trim() && !isTyping ? 1.05 : 1 }}
                whileTap={{ scale: inputValue.trim() && !isTyping ? 0.95 : 1 }}
              >
                <PaperAirplaneIcon className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant