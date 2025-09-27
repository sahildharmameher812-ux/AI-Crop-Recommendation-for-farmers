import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Crop Recommendation', path: '/crop-recommendation' },
    { name: 'Disease Detection', path: '/disease-detection' },
    { name: 'Weather Forecast', path: '/weather' },
    { name: 'Market Data', path: '/market-data' },
    { name: 'About Us', path: '/about' },
  ]

  const governmentLinks = [
    { name: 'Government of Jharkhand', url: 'https://jharkhand.gov.in' },
    { name: 'Department of Agriculture', url: 'https://jharkhand.gov.in/agriculture' },
    { name: 'Digital India', url: 'https://digitalindia.gov.in' },
    { name: 'National Portal of India', url: 'https://india.gov.in' },
  ]

  return (
    <footer className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                <span className="text-white font-bold text-2xl">🌾</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">CropAI</h3>
                <p className="text-green-200 text-sm">Smart Farming Solutions</p>
              </div>
            </div>
            <p className="text-green-100 leading-relaxed">
              Empowering farmers in Jharkhand with AI-driven crop recommendations, 
              disease detection, and smart agricultural insights for sustainable farming.
            </p>
            <div className="flex items-center space-x-2 text-green-200">
              <HeartIcon className="h-4 w-4 text-red-400" />
              <span className="text-sm">Made with love for our farmers</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-green-200 hover:text-white transition-colors duration-200 text-sm hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Government Links */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold text-white">Government Links</h4>
            <ul className="space-y-3">
              {governmentLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-200 hover:text-white transition-colors duration-200 text-sm hover:underline flex items-center space-x-1"
                  >
                    <span>{link.name}</span>
                    <GlobeAltIcon className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold text-white">Contact Information</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-100 text-sm leading-relaxed">
                    Department of Higher and Technical Education<br />
                    Government of Jharkhand<br />
                    Ranchi, Jharkhand - 834001
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                <p className="text-green-100 text-sm">+91-651-2234567</p>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                <p className="text-green-100 text-sm">cropai@jharkhand.gov.in</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="mt-16 pt-8 border-t border-green-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-green-200 text-sm">
                © {currentYear} CropAI - Government of Jharkhand. All rights reserved.
              </p>
              <p className="text-green-300 text-xs mt-1">
                Developed under Digital India Initiative
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/privacy-policy"
                className="text-green-200 hover:text-white text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="text-green-200 hover:text-white text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                to="/accessibility"
                className="text-green-200 hover:text-white text-sm transition-colors duration-200"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Government Badge */}
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-gradient-to-r from-orange-500 to-green-600 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center space-x-4 text-white">
              <div className="text-2xl">🇮🇳</div>
              <div className="text-center">
                <p className="font-semibold text-sm">Government of India Initiative</p>
                <p className="text-xs opacity-90">Empowering Farmers Through Technology</p>
              </div>
              <div className="text-2xl">🌾</div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer