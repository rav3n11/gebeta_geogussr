import React, { createContext, useContext, useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { generateRandomName, generateAvatarUrl, getStoredUserName, storeUserName } from '../utils/userGenerator'

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
    const initializeTelegram = () => {
      // Check if we're running in Telegram Web App
      console.log('Checking for Telegram WebApp...')
      console.log('window.Telegram:', window.Telegram)
      console.log('window.Telegram?.WebApp:', window.Telegram?.WebApp)
      console.log('Document ready state:', document.readyState)
      
      // Try multiple detection methods
      let tg = null
      
      // Method 1: Direct check with better validation
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp
        
        // Check if we're actually in Telegram (not just script loaded)
        if (webApp.initData && webApp.initDataUnsafe && webApp.platform) {
          tg = webApp
          console.log('Telegram WebApp detected via direct check!')
        } else {
          console.log('Telegram WebApp script loaded but not in Telegram environment')
        }
      }
      
      // Method 2: Try calling expand() method (Telegram-specific)
      if (!tg && typeof window !== 'undefined' && window.Telegram?.WebApp) {
        try {
          const webApp = window.Telegram.WebApp
          webApp.expand()
          
          // Only set if we have proper Telegram data
          if (webApp.initData && webApp.initDataUnsafe && webApp.platform) {
            tg = webApp
            console.log('Telegram WebApp detected via expand() method!')
          }
        } catch (error) {
          console.log('expand() method failed:', error)
        }
      }
      
      // Method 3: Check for Telegram-specific properties
      if (!tg && typeof window !== 'undefined' && window.Telegram) {
        const telegramObj = window.Telegram as any
        const webApp = telegramObj.WebApp || telegramObj.webApp
        
        if (webApp && webApp.initData && webApp.initDataUnsafe && webApp.platform) {
          tg = webApp
          console.log('Telegram WebApp detected via property check!')
        }
      }
      
      if (tg) {
        
        console.log('Telegram WebApp detected:', tg)
        console.log('Init data unsafe:', tg.initDataUnsafe)
        console.log('User data:', tg.initDataUnsafe?.user)
        console.log('Init data:', tg.initData)
        console.log('Platform:', tg.platform)
        console.log('Version:', tg.version)
        
        // Initialize the Web App
        tg.ready()
        tg.expand()
        
        // Set up the Web App
        setWebApp(tg)
        
        // Extract user data - try multiple sources
        let userData = tg.initDataUnsafe?.user
        
        // If no user data in initDataUnsafe, try parsing initData manually
        if (!userData && tg.initData) {
          try {
            const urlParams = new URLSearchParams(tg.initData)
            const userParam = urlParams.get('user')
            if (userParam) {
              userData = JSON.parse(decodeURIComponent(userParam))
              console.log('Parsed user data from initData:', userData)
            }
          } catch (error) {
            console.error('Error parsing user data from initData:', error)
          }
        }
        
        if (userData) {
          console.log('Setting real user data:', userData)
          setUser(userData)
        } else {
          console.log('No user data found in Telegram WebApp - using random name')
          // Fallback user data when Telegram WebApp is detected but no user data
          let userName = getStoredUserName()
          if (!userName) {
            userName = generateRandomName()
            storeUserName(userName)
          }
          
          const fallbackUser: TelegramUser = {
            id: 999999999,
            first_name: userName,
            last_name: '',
            language_code: 'en',
            is_premium: false,
            photo_url: generateAvatarUrl(userName)
          }
          setUser(fallbackUser)
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
        // Not in Telegram WebApp - check if we're in production
        const isProduction = import.meta.env.PROD
        const isSimulateProduction = import.meta.env.VITE_SIMULATE_PRODUCTION === 'true'
        
        console.log('Not in Telegram WebApp')
        console.log('Production mode:', isProduction)
        console.log('Simulate production:', isSimulateProduction)
        
        // Only use fallback user if we're explicitly simulating production
        // In real production, we should still try to get Telegram data
        if (isSimulateProduction) {
          // Simulate production mode - use random name like in development
          console.log('Using simulated production with random name')
          let userName = getStoredUserName()
          if (!userName) {
            userName = generateRandomName()
            storeUserName(userName)
          }
          
          const fallbackUser: TelegramUser = {
            id: 999999999,
            first_name: userName,
            last_name: '',
            language_code: 'en',
            is_premium: false,
            photo_url: generateAvatarUrl(userName)
          }
          setUser(fallbackUser)
        } else {
          // Development mode or real production - use random name with avatar
          console.log('Using development mode with random name')
          let userName = getStoredUserName()
          if (!userName) {
            userName = generateRandomName()
            storeUserName(userName)
          }
          
          const mockUser: TelegramUser = {
            id: Math.floor(Math.random() * 1000000) + 100000, // Random ID
            first_name: userName,
            last_name: '',
            language_code: 'en',
            is_premium: false,
            photo_url: generateAvatarUrl(userName)
          }
          setUser(mockUser)
        }
        
        setIsReady(true)
      }
    }

    // Try to initialize immediately
    initializeTelegram()

    // Also try after multiple delays in case Telegram WebApp loads asynchronously
    const timeoutIds = [
      setTimeout(() => {
        if (!webApp) {
          console.log('Retrying Telegram WebApp detection after 500ms')
          initializeTelegram()
        }
      }, 500),
      setTimeout(() => {
        if (!webApp) {
          console.log('Retrying Telegram WebApp detection after 1000ms')
          initializeTelegram()
        }
      }, 1000),
      setTimeout(() => {
        if (!webApp) {
          console.log('Retrying Telegram WebApp detection after 2000ms')
          initializeTelegram()
        }
      }, 2000),
      setTimeout(() => {
        if (!webApp) {
          console.log('Retrying Telegram WebApp detection after 5000ms')
          initializeTelegram()
        }
      }, 5000)
    ]

    // Also try when the window loads completely
    const handleLoad = () => {
      if (!webApp) {
        console.log('Retrying Telegram WebApp detection on window load')
        initializeTelegram()
      }
    }
    
    // Try when DOM is ready
    const handleDOMContentLoaded = () => {
      if (!webApp) {
        console.log('Retrying Telegram WebApp detection on DOMContentLoaded')
        initializeTelegram()
      }
    }
    
    window.addEventListener('load', handleLoad)
    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded)
    
    // Also try when the Telegram script might load
    const checkTelegramScript = () => {
      if (!webApp && window.Telegram?.WebApp) {
        console.log('Telegram script loaded, retrying detection')
        initializeTelegram()
      }
    }
    
    // Check periodically for Telegram script
    const scriptCheckInterval = setInterval(() => {
      if (window.Telegram?.WebApp) {
        clearInterval(scriptCheckInterval)
        checkTelegramScript()
      }
    }, 100)
    
    // Clear interval after 10 seconds
    setTimeout(() => clearInterval(scriptCheckInterval), 10000)

    return () => {
      timeoutIds.forEach(id => clearTimeout(id))
      window.removeEventListener('load', handleLoad)
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded)
      clearInterval(scriptCheckInterval)
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
