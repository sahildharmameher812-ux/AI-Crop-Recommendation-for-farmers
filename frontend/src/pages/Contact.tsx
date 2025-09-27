import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  PaperAirplaneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  category: string
  message: string
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      details: '+91-651-2234567',
      description: '24x7 Helpline for farmers',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      details: 'cropai@jharkhand.gov.in',
      description: 'Technical support & queries',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: MapPinIcon,
      title: 'Office Address',
      details: 'Department of Higher and Technical Education',
      description: 'Government of Jharkhand, Ranchi - 834001',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: ClockIcon,
      title: 'Support Hours',
      details: '24x7 Available',
      description: 'Round the clock assistance',
      color: 'from-orange-500 to-red-600'
    }
  ]

  const faqCategories = [
    {
      icon: '🌾',
      title: 'Crop Recommendations',
      description: 'Get help with AI-powered crop suggestions and farming advice'
    },
    {
      icon: '🔬',
      title: 'Disease Detection',
      description: 'Support for plant disease identification and treatment'
    },
    {
      icon: '🌤️',
      title: 'Weather & Market',
      description: 'Assistance with weather forecasts and market data'
    },
    {
      icon: '⚙️',
      title: 'Technical Issues',
      description: 'Help with app functionality and technical problems'
    }
  ]

  const categories = [
    'General Inquiry',
    'Crop Recommendation',
    'Disease Detection',
    'Weather Information',
    'Market Data',
    'Technical Support',
    'Feedback/Suggestion'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        message: ''
      })
      
      toast.success('Message sent successfully! We will get back to you soon.')
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Contact & Support</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Need help with CropAI? Our dedicated support team is here to assist you 24/7 
            with any questions or technical issues.
          </p>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Get in Touch
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                className="agricultural-card text-center h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{info.title}</h3>
                <p className="text-gray-800 font-medium mb-2">{info.details}</p>
                <p className="text-sm text-gray-600">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            className="agricultural-card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <PaperAirplaneIcon className="w-6 h-6 text-green-600 mr-3" />
              Send us a Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="w-4 h-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="agricultural-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="agricultural-input"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="agricultural-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="agricultural-select"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief subject of your message"
                  className="agricultural-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please describe your query or issue in detail..."
                  rows={6}
                  className="agricultural-input resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`agricultural-button w-full ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="loader w-5 h-5 mr-2"></div>
                    Sending Message...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Support Categories & FAQ */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Support Categories */}
            <div className="agricultural-card">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600 mr-3" />
                Support Categories
              </h2>
              <div className="space-y-4">
                {faqCategories.map((category) => (
                  <div key={category.title} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl">{category.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{category.title}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Support */}
            <div className="agricultural-card">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                🚀 Quick Support
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">WhatsApp Support</span>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    Get instant help via WhatsApp for urgent farming queries
                  </p>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Chat on WhatsApp
                  </button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Live Chat</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Connect with our agricultural experts for real-time assistance
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Start Live Chat
                  </button>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="agricultural-card">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📞 Response Times
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phone Support</span>
                  <span className="font-semibold text-green-600">Immediate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">WhatsApp/Chat</span>
                  <span className="font-semibold text-blue-600">&lt; 5 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email Support</span>
                  <span className="font-semibold text-orange-600">&lt; 24 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Contact Form</span>
                  <span className="font-semibold text-purple-600">&lt; 48 hours</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Emergency Contact */}
        <motion.div
          className="agricultural-card mt-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-2xl text-white mb-6 inline-block">
            <h2 className="text-xl font-bold mb-2">🚨 Emergency Agricultural Support</h2>
            <p className="text-sm opacity-90">For urgent crop disease outbreaks or weather emergencies</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">24x7 Emergency Hotline</h3>
              <p className="text-2xl font-bold text-red-600">1800-123-CROP</p>
              <p className="text-sm text-gray-600">Toll-free emergency support</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Agricultural Officer Direct</h3>
              <p className="text-2xl font-bold text-green-600">+91-651-2234999</p>
              <p className="text-sm text-gray-600">Direct line to field officers</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Contact