import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { openGlobalChatbot } from '../hooks/useChatbot'
import {
  BeakerIcon,
  CameraIcon,
  CloudIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

const Home: React.FC = () => {
  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Assistant',
      description: 'Chat with our intelligent agricultural expert for instant answers on farming, diseases, weather, and market insights in your language.',
      link: '#chatbot',
      color: 'from-blue-500 to-purple-600',
      emoji: '🤖'
    },
    {
      icon: BeakerIcon,
      title: 'Smart Crop Recommendation',
      description: 'AI-powered analysis of soil conditions, weather patterns, and market trends to suggest the most profitable crops for your land.',
      link: '/crop-recommendation',
      color: 'from-green-500 to-emerald-600',
      emoji: '🌱'
    },
    {
      icon: CameraIcon,
      title: 'Disease Detection',
      description: 'Upload crop images to instantly identify diseases and receive expert treatment recommendations with preventive measures.',
      link: '/disease-detection',
      color: 'from-red-500 to-pink-600',
      emoji: '🔬'
    },
    {
      icon: CloudIcon,
      title: 'Weather Insights',
      description: 'Real-time weather forecasts and agricultural alerts to help you make informed farming decisions.',
      link: '/weather',
      color: 'from-blue-500 to-cyan-600',
      emoji: '🌤️'
    },
    {
      icon: ChartBarIcon,
      title: 'Market Intelligence',
      description: 'Live market prices, demand forecasts, and pricing trends to maximize your crop profitability.',
      link: '/market-data',
      color: 'from-purple-500 to-indigo-600',
      emoji: '📈'
    }
  ]

  const stats = [
    { number: '50K+', label: 'Farmers Helped', icon: '👨‍🌾' },
    { number: '95%', label: 'Accuracy Rate', icon: '🎯' },
    { number: '30+', label: 'Crop Types', icon: '🌾' },
    { number: '24/7', label: 'Support', icon: '🔧' }
  ]

  const benefits = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Insights',
      description: 'Advanced machine learning algorithms analyze multiple data sources for precise recommendations.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Government Verified',
      description: 'Official Government of Jharkhand initiative ensuring authentic and reliable agricultural guidance.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Multilingual Support',
      description: 'Available in local languages including Hindi, English, and regional dialects.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Driven',
      description: 'Connect with fellow farmers and agricultural experts for knowledge sharing and support.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-800/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Government of Jharkhand Initiative
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                <span className="gradient-text">Smart Farming</span><br />
                <span className="text-gray-800">with AI-Powered</span><br />
                <span className="text-green-600">Crop Intelligence</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                Empowering farmers in Jharkhand with cutting-edge AI technology for optimal crop selection, 
                disease detection, and sustainable farming practices. Transform your agricultural success today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/crop-recommendation" className="agricultural-button flex items-center justify-center space-x-2">
                  <BeakerIcon className="w-5 h-5" />
                  <span>Get Crop Recommendations</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link to="/disease-detection" className="agricultural-button-secondary flex items-center justify-center space-x-2">
                  <CameraIcon className="w-5 h-5" />
                  <span>Detect Plant Diseases</span>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  >
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold text-green-600">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl p-8 shadow-2xl">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-80 animate-float"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400 rounded-full opacity-60 animate-float" style={{animationDelay: '1s'}}></div>
                
                <div className="relative z-10 text-white text-center space-y-6">
                  <div className="text-6xl mb-4">🌾</div>
                  <h3 className="text-2xl font-bold">AI-Powered Agriculture</h3>
                  <p className="text-green-100">
                    Experience the future of farming with intelligent crop recommendations and disease detection
                  </p>
                  <div className="flex justify-center">
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center space-x-2">
                      <PlayIcon className="w-5 h-5" />
                      <span>Watch Demo</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="gradient-text">Comprehensive Agricultural Solutions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From crop selection to disease management, our AI-powered platform provides end-to-end support for modern farming
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {feature.link === '#chatbot' ? (
                  <div 
                    onClick={() => openGlobalChatbot()}
                    className="block cursor-pointer"
                  >
                    <div className="agricultural-card group-hover:scale-105 h-full">
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-3xl">{feature.emoji}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                      
                      <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700 transition-colors">
                        <span>Start Chatting</span>
                        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link to={feature.link} className="block">
                    <div className="agricultural-card group-hover:scale-105 h-full">
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-3xl">{feature.emoji}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                      
                      <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700 transition-colors">
                        <span>Learn More</span>
                        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 earth-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-orange-800">Why Choose CropAI?</span>
            </h2>
            <p className="text-xl text-orange-700 max-w-3xl mx-auto">
              Backed by government initiatives and powered by cutting-edge technology for sustainable agriculture
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="flex items-start space-x-6 agricultural-card"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sky-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold text-blue-900">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-xl text-blue-700 max-w-2xl mx-auto">
              Join thousands of farmers in Jharkhand who are already using CropAI to increase their yields and profits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/crop-recommendation" className="agricultural-button text-lg px-8 py-4">
                Start Your Journey
              </Link>
              <Link to="/about" className="agricultural-button-secondary text-lg px-8 py-4">
                Learn More About Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home