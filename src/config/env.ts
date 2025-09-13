// Environment configuration
export const config = {
  // App URL - used for API calls and external references
  appUrl: (() => {
    if (typeof window !== 'undefined') {
      // Client-side: use Vite environment variable or current origin
      return import.meta.env.VITE_APP_URL || window.location.origin
    } else {
      // Server-side: use Node environment variable
      return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  })(),
  
  // API base URL
  apiUrl: (() => {
    if (typeof window !== 'undefined') {
      // Client-side: use Vite environment variable or current origin
      return import.meta.env.VITE_APP_URL || window.location.origin
    } else {
      // Server-side: use Node environment variable
      return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  })() + '/api',
  
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
