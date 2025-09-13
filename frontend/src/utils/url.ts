// URL utilities using unified configuration
import { appUrl, apiUrl } from '../config/env'

/**
 * Get the full API URL for a specific endpoint
 */
export function getApiUrl(endpoint: string): string {
  return `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

/**
 * Get the full app URL for a specific path
 */
export function getAppUrl(path: string = ''): string {
  return `${appUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Get the WebSocket URL (if needed in the future)
 */
export function getWebSocketUrl(): string {
  const url = new URL(appUrl)
  return `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}`
}

/**
 * Check if we're running in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV
}

/**
 * Check if we're running in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.PROD
}
