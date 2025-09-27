import React from 'react'
import { motion } from 'framer-motion'
import {
  HeartIcon,
  SparklesIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  LightBulbIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const About: React.FC = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Intelligence',
      description: 'Advanced machine learning algorithms analyze soil conditions, weather patterns, and market trends to provide accurate recommendations.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Government Backed',
      description: 'Official initiative by the Government of Jharkhand under the Digital India program, ensuring reliability and authenticity.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: GlobeAltIcon,
      title: 'Multilingual Support',
      description: 'Available in Hindi, English, and local dialects to ensure accessibility for farmers across Jharkhand.',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Data',
      description: 'Live market prices, weather forecasts, and soil analysis provide up-to-date information for informed decision making.',
      color: 'from-orange-500 to-red-600'
    }
  ]

  const stats = [
    { number: '50,000+', label: 'Farmers Registered', icon: '👨‍🌾' },
    { number: '95%', label: 'Prediction Accuracy', icon: '🎯' },
    { number: '30+', label: 'Crop Varieties', icon: '🌾' },
    { number: '24x7', label: 'Support Available', icon: '💬' }
  ]

  const objectives = [
    {
      title: 'Increase Agricultural Productivity',
      description: 'Help farmers achieve better yields through scientific crop selection and farming practices.',
      icon: '📈'
    },
    {
      title: 'Reduce Crop Losses',
      description: 'Early disease detection and weather alerts to minimize crop damage and financial losses.',
      icon: '🛡️'
    },
    {
      title: 'Improve Farm Income',
      description: 'Market intelligence and optimal selling time recommendations to maximize profits.',
      icon: '💰'
    },
    {
      title: 'Promote Sustainable Farming',
      description: 'Encourage eco-friendly practices and efficient resource utilization for long-term sustainability.',
      icon: '🌱'
    }
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl flex items-center justify-center">
              <HeartIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            <span className="gradient-text">About CropAI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Empowering farmers in Jharkhand with cutting-edge AI technology to revolutionize agriculture 
            through intelligent crop recommendations, disease detection, and smart farming solutions.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          className="agricultural-card mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-full mb-6">
            <span className="text-2xl mr-3">🎯</span>
            <span className="font-semibold text-green-800">Our Mission</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Transforming Agriculture Through Technology
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our mission is to bridge the gap between traditional farming practices and modern technology, 
            providing Jharkhand's farmers with AI-powered tools that enhance productivity, reduce risks, 
            and promote sustainable agricultural practices for a prosperous farming community.
          </p>
        </motion.div>

        {/* Key Features */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose CropAI?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="agricultural-card h-full"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          className="agricultural-card mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Our Impact in Numbers
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Objectives */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Our Objectives
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {objectives.map((objective, index) => (
              <motion.div
                key={objective.title}
                className="flex items-start space-x-4 agricultural-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <div className="text-3xl flex-shrink-0">{objective.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{objective.title}</h3>
                  <p className="text-gray-600">{objective.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          className="agricultural-card mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Powered by Advanced Technology
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Machine Learning</h3>
              <p className="text-gray-600 text-sm">
                Advanced ML models trained on agricultural data to provide accurate crop recommendations and disease predictions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Satellite Data</h3>
              <p className="text-gray-600 text-sm">
                Integration with satellite imagery and soil data from various APIs including Soil Grids and Bhuvan.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LightBulbIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">AI Vision</h3>
              <p className="text-gray-600 text-sm">
                Computer vision technology for accurate plant disease identification from uploaded images.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Government Partnership */}
        <motion.div
          className="agricultural-card text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-green-600 p-6 rounded-3xl shadow-xl">
              <div className="flex items-center space-x-4 text-white">
                <div className="text-4xl">🇮🇳</div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">Government of Jharkhand</h3>
                  <p className="text-sm opacity-90">Department of Higher and Technical Education</p>
                </div>
                <div className="text-4xl">🌾</div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Official Government Initiative
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            CropAI is developed under the Digital India initiative by the Government of Jharkhand, 
            ensuring authentic, reliable, and scientifically-backed agricultural guidance for farmers 
            across the state. This partnership guarantees continuous support and regular updates to 
            meet evolving agricultural needs.
          </p>
          
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <h4 className="font-bold text-blue-800 mb-2">Free for All Farmers</h4>
              <p className="text-sm text-blue-700">
                Completely free service for all registered farmers in Jharkhand
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <h4 className="font-bold text-green-800 mb-2">Scientifically Validated</h4>
              <p className="text-sm text-green-700">
                All recommendations backed by agricultural research and field trials
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <h4 className="font-bold text-purple-800 mb-2">Continuous Innovation</h4>
              <p className="text-sm text-purple-700">
                Regular updates with latest agricultural technologies and practices
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default About