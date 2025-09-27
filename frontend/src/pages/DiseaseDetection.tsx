import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  CameraIcon,
  PhotoIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  SparklesIcon,
  ClockIcon,
  ShieldCheckIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface AnalysisResult {
  disease: string
  confidence: number
  severity: 'Low' | 'Medium' | 'High'
  description: string
  causes: string[]
  symptoms: string[]
  treatments: string[]
  prevention: string[]
  affectedCrops: string[]
}

const DiseaseDetection: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Mock analysis result for demo
  const mockAnalysisResult: AnalysisResult = {
    disease: 'Tomato Late Blight',
    confidence: 94.5,
    severity: 'High',
    description: 'Late blight is a destructive disease affecting tomato and potato crops. It spreads rapidly in humid conditions and can destroy entire crops if left untreated.',
    causes: [
      'Phytophthora infestans fungus-like organism',
      'High humidity (>90%)',
      'Cool temperatures (15-20°C)',
      'Poor air circulation',
      'Overhead watering'
    ],
    symptoms: [
      'Dark, water-soaked lesions on leaves',
      'Brown spots with yellow halos',
      'White fuzzy growth on leaf undersides',
      'Rapid leaf yellowing and death',
      'Dark lesions on stems and fruits'
    ],
    treatments: [
      'Apply copper-based fungicides immediately',
      'Remove and destroy infected plant parts',
      'Improve air circulation around plants',
      'Apply Bordeaux mixture (1% solution)',
      'Use systemic fungicides like Mancozeb'
    ],
    prevention: [
      'Plant resistant varieties',
      'Ensure proper spacing between plants',
      'Water at soil level, avoid overhead irrigation',
      'Apply preventive fungicide sprays',
      'Practice crop rotation'
    ],
    affectedCrops: ['Tomato', 'Potato', 'Eggplant', 'Pepper']
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setAnalysisResult(null)
        toast.success('Image uploaded successfully!')
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024
  })

  const analyzeImage = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image first')
      return
    }

    setIsAnalyzing(true)
    setUploadProgress(0)

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setUploadProgress(100)
      setAnalysisResult(mockAnalysisResult)
      toast.success('Analysis completed successfully!')
    } catch (error) {
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
      clearInterval(progressInterval)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setAnalysisResult(null)
    setUploadProgress(0)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'High': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }


  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <CameraIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">AI-Powered Disease Detection</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a photo of your crop to instantly identify diseases and receive expert treatment recommendations
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          className="agricultural-card mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {!uploadedImage ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-green-500 bg-green-50'
                  : isDragReject
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50/30'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-6">
                <div className="flex justify-center">
                  <PhotoIcon className="w-16 h-16 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {isDragActive ? 'Drop the image here' : 'Upload Crop Image'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Drag and drop your image here, or click to select
                  </p>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Supported formats: JPG, PNG, WebP, BMP</p>
                    <p>Maximum size: 10MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="agricultural-button inline-flex items-center space-x-2"
                >
                  <CameraIcon className="w-5 h-5" />
                  <span>Choose Image</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded crop"
                  className="w-full h-64 object-cover rounded-xl border border-gray-200"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-4 right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              {!analysisResult && (
                <div className="text-center">
                  <button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className={`agricultural-button inline-flex items-center space-x-2 ${
                      isAnalyzing ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="loader w-5 h-5"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5" />
                        <span>Analyze Disease</span>
                      </>
                    )}
                  </button>
                  
                  {isAnalyzing && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-green-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Analyzing image... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
            >
              {/* Disease Identification */}
              <div className="agricultural-card">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Disease Identified: {analysisResult.disease}
                    </h2>
                    <p className="text-gray-600">{analysisResult.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-6">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(analysisResult.severity)}`}>
                      {analysisResult.severity} Severity
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResult.confidence}%
                      </div>
                      <div className="text-xs text-gray-500">Confidence</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <InformationCircleIcon className="w-5 h-5 mr-2" />
                      Affected Crops
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.affectedCrops.map((crop) => (
                        <span key={crop} className="agricultural-badge">
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-xl p-4">
                    <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                      <ClockIcon className="w-5 h-5 mr-2" />
                      Action Required
                    </h4>
                    <p className="text-orange-700 text-sm">
                      {analysisResult.severity === 'High' 
                        ? 'Immediate treatment required to prevent crop loss'
                        : analysisResult.severity === 'Medium'
                        ? 'Treatment recommended within 24-48 hours'
                        : 'Monitor closely and apply preventive measures'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div className="agricultural-card">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3" />
                  Symptoms to Look For
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {analysisResult.symptoms.map((symptom, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Causes */}
              <div className="agricultural-card">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <BeakerIcon className="w-6 h-6 text-blue-600 mr-3" />
                  Common Causes
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {analysisResult.causes.map((cause, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Treatment Recommendations */}
              <div className="agricultural-card border-red-200 bg-red-50/30">
                <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
                  Immediate Treatment Recommendations
                </h3>
                <div className="space-y-4">
                  {analysisResult.treatments.map((treatment, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-red-100">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-gray-800 font-medium">{treatment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prevention Measures */}
              <div className="agricultural-card border-green-200 bg-green-50/30">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600 mr-3" />
                  Prevention for Future
                </h3>
                <div className="space-y-4">
                  {analysisResult.prevention.map((measure, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-green-100">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-gray-800">{measure}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <button
                  onClick={() => {
                    setUploadedImage(null)
                    setAnalysisResult(null)
                  }}
                  className="agricultural-button flex items-center justify-center space-x-2"
                >
                  <CameraIcon className="w-5 h-5" />
                  <span>Analyze Another Image</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="agricultural-button-secondary flex items-center justify-center space-x-2"
                >
                  <span>📄</span>
                  <span>Print Report</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Section */}
        {!analysisResult && (
          <motion.div
            className="agricultural-card mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📸 Tips for Best Results
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Image Quality</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Take photos in good lighting conditions</li>
                  <li>• Ensure the affected area is clearly visible</li>
                  <li>• Avoid blurry or out-of-focus images</li>
                  <li>• Fill the frame with the plant/leaf</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">What to Capture</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Focus on leaves, stems, or fruits showing symptoms</li>
                  <li>• Include both affected and healthy parts if possible</li>
                  <li>• Take multiple angles if symptoms are unclear</li>
                  <li>• Capture early symptoms for better prevention</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default DiseaseDetection