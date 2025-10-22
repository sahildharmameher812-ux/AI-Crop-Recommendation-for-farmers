import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  BeakerIcon,
  CameraIcon,
  CloudIcon,
  ChartBarIcon,
  InformationCircleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid,
  BeakerIcon as BeakerSolid,
  CameraIcon as CameraSolid,
  CloudIcon as CloudSolid,
  ChartBarIcon as ChartBarSolid,
  InformationCircleIcon as InformationSolid,
  PhoneIcon as PhoneSolid
} from '@heroicons/react/24/solid'

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  const navigationItems = [
    { name: 'Home', path: '/', icon: HomeIcon, solidIcon: HomeSolid },
    { name: 'AI Assistant', path: '/ai-assistant', icon: ChatBubbleLeftRightIcon, solidIcon: ChatBubbleLeftRightIcon },
    { name: 'Crop Recommendation', path: '/crop-recommendation', icon: BeakerIcon, solidIcon: BeakerSolid },
    { name: 'Disease Detection', path: '/disease-detection', icon: CameraIcon, solidIcon: CameraSolid },
    { name: 'Weather', path: '/weather', icon: CloudIcon, solidIcon: CloudSolid },
    { name: 'Market Data', path: '/market-data', icon: ChartBarIcon, solidIcon: ChartBarSolid },
    { name: 'About', path: '/about', icon: InformationCircleIcon, solidIcon: InformationSolid },
    { name: 'Contact', path: '/contact', icon: PhoneIcon, solidIcon: PhoneSolid },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => location.pathname === path
  
  const handleNavClick = (_item: typeof navigationItems[0], _e: React.MouseEvent) => {
    // No special handling needed - all navigation uses regular routing
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'nav-gradient shadow-2xl' : 'nav-gradient'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/" className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                  <span className="text-white font-bold text-xl">🌾</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white drop-shadow-md">CropAI</h1>
                  <p className="text-xs text-green-100 -mt-1">Smart Farming</p>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item, index) => {
                const IconComponent = isActive(item.path) ? item.solidIcon : item.icon
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      onClick={(e) => handleNavClick(item, e)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive(item.path)
                          ? 'bg-white/20 text-white shadow-md backdrop-blur-sm'
                          : 'text-green-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="hidden xl:inline">{item.name}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:bg-white/10 p-2 rounded-xl transition-colors duration-200"
              >
                {isOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="nav-gradient border-t border-white/10">
            <div className="px-4 py-6 space-y-3">
              {navigationItems.map((item) => {
                const IconComponent = isActive(item.path) ? item.solidIcon : item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={(e) => {
                      handleNavClick(item, e)
                      setIsOpen(false)
                    }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-white/20 text-white shadow-md backdrop-blur-sm'
                        : 'text-green-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>
    </>
  )
}

export default Navbar