// Environment configuration
export const config = {
  // App URL - used for external references (frontend URL)
  appUrl: (() => {
    if (typeof window !== 'undefined') {
      // Client-side: use Vite environment variable or current origin
      return import.meta.env.VITE_APP_URL || window.location.origin
    } else {
      // Server-side: use Node environment variable
      return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  })(),
  
  // API base URL - points to backend service
  apiUrl: (() => {
    if (typeof window !== 'undefined') {
      // Client-side: use backend URL from environment
      return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    } else {
      // Server-side: use backend URL from environment
      return process.env.API_URL || 'http://localhost:3000/api'
    }
  })(),
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Telegram
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  
  // MongoDB
  mongodbUri: process.env.MONGODB_URI,
  
  // Maps API
  gebetaMapsApiKey: import.meta.env.VITE_GEBETA_MAPS_API_KEY,
}

// Export individual values for convenience
export const {
  appUrl,
  apiUrl,
  isDevelopment,
  isProduction,
  telegramBotToken,
  mongodbUri,
  gebetaMapsApiKey
} = config
