// Environment configuration (frontend only)
export const config = {
  // App URL - used for external references (frontend URL)
  appUrl: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  
  // API base URL - points to backend service
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Maps API
  gebetaMapsApiKey: import.meta.env.VITE_GEBETA_MAPS_API_KEY,
}

// Export individual values for convenience
export const {
  appUrl,
  apiUrl,
  isDevelopment,
  isProduction,
  gebetaMapsApiKey
} = config
