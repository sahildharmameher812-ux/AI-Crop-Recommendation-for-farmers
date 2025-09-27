import { useState, useCallback } from 'react'

// Simple hook to manage chatbot state
export const useChatbot = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  const openChatbot = useCallback(() => {
    setIsChatbotOpen(true)
  }, [])

  const closeChatbot = useCallback(() => {
    setIsChatbotOpen(false)
  }, [])

  const toggleChatbot = useCallback(() => {
    setIsChatbotOpen(prev => !prev)
  }, [])

  return {
    isChatbotOpen,
    openChatbot,
    closeChatbot,
    toggleChatbot,
    setIsChatbotOpen
  }
}

// Global chatbot instance for external control
let globalChatbotController: {
  openChatbot: () => void
  closeChatbot: () => void
  toggleChatbot: () => void
} | null = null

export const setChatbotController = (controller: typeof globalChatbotController) => {
  globalChatbotController = controller
}

export const openGlobalChatbot = () => {
  if (globalChatbotController) {
    globalChatbotController.openChatbot()
  }
}

export const closeGlobalChatbot = () => {
  if (globalChatbotController) {
    globalChatbotController.closeChatbot()
  }
}

export const toggleGlobalChatbot = () => {
  if (globalChatbotController) {
    globalChatbotController.toggleChatbot()
  }
}