// API client for backend communication
import { apiUrl } from '../config/env'

export interface ScoreSubmission {
  score: number
  city: string
  gameMode: 'random' | 'city'
  distance?: number
  roundScore?: number
}

export interface LeaderboardEntry {
  _id: string
  userId: number
  username?: string
  firstName: string
  lastName?: string
  score: number
  city: string
  gameMode: 'random' | 'city'
  timestamp: string
  distance?: number
  roundScore?: number
  rank?: number
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  userBestScore?: LeaderboardEntry
  total: number
}

export interface ScoreSubmissionResponse {
  success: boolean
  scoreId: string
  globalLeaderboard: LeaderboardEntry[]
  cityLeaderboard: LeaderboardEntry[]
}

export class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = apiUrl
  }

  async submitScore(scoreData: ScoreSubmission, initData: string): Promise<ScoreSubmissionResponse> {
    const response = await fetch(`${this.baseUrl}/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...scoreData,
        initData
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit score')
    }

    return response.json()
  }

  async getGlobalLeaderboard(limit: number = 100, gameMode?: string): Promise<LeaderboardResponse> {
    const params = new URLSearchParams({
      limit: limit.toString()
    })
    
    if (gameMode) {
      params.append('gameMode', gameMode)
    }

    const response = await fetch(`${this.baseUrl}/leaderboard?${params}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch leaderboard')
    }

    return response.json()
  }

  async getCityLeaderboard(city: string, limit: number = 50): Promise<LeaderboardResponse> {
    const params = new URLSearchParams({
      city,
      limit: limit.toString()
    })

    const response = await fetch(`${this.baseUrl}/leaderboard/city?${params}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch city leaderboard')
    }

    return response.json()
  }

  async getUserLeaderboard(userId: number, limit: number = 100): Promise<LeaderboardResponse> {
    const params = new URLSearchParams({
      userId: userId.toString(),
      limit: limit.toString()
    })

    const response = await fetch(`${this.baseUrl}/leaderboard?${params}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch user leaderboard')
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
