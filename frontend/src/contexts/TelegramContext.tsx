import React, { createContext, useContext, useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'

type WebAppType = typeof WebApp

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

export interface TelegramWebAppData {
  user: TelegramUser | null
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    auth_date?: number
    hash?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }
  isClosingConfirmationEnabled: boolean
  headerColor: string
  backgroundColor: string
  isVerticalSwipesEnabled: boolean
  isHorizontalSwipesEnabled: boolean
}

interface TelegramContextType {
  webApp: WebAppType | null
  user: TelegramUser | null
  isReady: boolean
  expand: () => void
  close: () => void
  showAlert: (message: string) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  showPopup: (params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type: 'default' | 'destructive'
      text: string
    }>
  }, callback?: (buttonId?: string) => void) => void
  hapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  sendData: (data: string) => void
  ready: () => void
}

const TelegramContext = createContext<TelegramContextType | null>(null)

export const useTelegram = () => {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider')
  }
  return context
}

interface TelegramProviderProps {
  children: React.ReactNode
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [webApp, setWebApp] = useState<WebAppType | null>(null)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check if we're running in Telegram Web App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      
      // Initialize the Web App
      tg.ready()
      tg.expand()
      
      // Set up the Web App
      setWebApp(tg)
      
      // Extract user data
      const userData = tg.initDataUnsafe?.user
      if (userData) {
        setUser(userData)
      }
      
      // Mark as ready
      setIsReady(true)
      
      // Set up theme
      document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff'
      
      // Handle theme changes
      const handleThemeChanged = () => {
        document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff'
      }
      
      tg.onEvent('themeChanged', handleThemeChanged)
      
      return () => {
        tg.offEvent('themeChanged', handleThemeChanged)
      }
    } else {
      // Development mode - create mock data
      const mockUser: TelegramUser = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'en',
        is_premium: false
      }
      
      setUser(mockUser)
      setIsReady(true)
    }
  }, [])

  const expand = () => {
    if (webApp) {
      webApp.expand()
    }
  }

  const close = () => {
    if (webApp) {
      webApp.close()
    }
  }

  const showAlert = (message: string) => {
    if (webApp) {
      webApp.showAlert(message)
    } else {
      alert(message)
    }
  }

  const showConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
    if (webApp) {
      webApp.showConfirm(message, callback)
    } else {
      const confirmed = confirm(message)
      if (callback) callback(confirmed)
    }
  }

  const showPopup = (params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type: 'default' | 'destructive'
      text: string
    }>
  }, callback?: (buttonId?: string) => void) => {
    if (webApp) {
      webApp.showPopup(params, callback)
    } else {
      alert(params.message)
      if (callback) callback('ok')
    }
  }

  const hapticFeedback = {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      if (webApp) {
        webApp.HapticFeedback.impactOccurred(style)
      }
    },
    notificationOccurred: (type: 'error' | 'success' | 'warning') => {
      if (webApp) {
        webApp.HapticFeedback.notificationOccurred(type)
      }
    },
    selectionChanged: () => {
      if (webApp) {
        webApp.HapticFeedback.selectionChanged()
      }
    }
  }

  const sendData = (data: string) => {
    if (webApp) {
      webApp.sendData(data)
    }
  }

  const ready = () => {
    if (webApp) {
      webApp.ready()
    }
  }

  const value: TelegramContextType = {
    webApp,
    user,
    isReady,
    expand,
    close,
    showAlert,
    showConfirm,
    showPopup,
    hapticFeedback,
    sendData,
    ready
  }

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp: WebAppType
    }
  }
}
