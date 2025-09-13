import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Spinner } from './ui/spinner'
import { apiClient } from '../utils/api'
import type { LeaderboardEntry } from '../utils/api'
import { useTelegram } from '../contexts/TelegramContext'
import { Trophy, Medal, Award, MapPin, Clock, ArrowLeft } from 'lucide-react'

interface CityLeaderboardProps {
  city: string
  onClose: () => void
}

export default function CityLeaderboard({ city, onClose }: CityLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userBestScore, setUserBestScore] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { } = useTelegram()

  useEffect(() => {
    loadCityLeaderboard()
  }, [city])

  const loadCityLeaderboard = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getCityLeaderboard(city, 50)
      setLeaderboard(response.leaderboard)
      setUserBestScore(response.userBestScore || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load city leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
  }

  const formatScore = (score: number) => {
    return score.toLocaleString()
  }

  const formatDistance = (distance?: number) => {
    if (!distance) return 'N/A'
    if (distance < 1) return `${Math.round(distance * 1000)}m`
    return `${distance.toFixed(1)}km`
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const getScoreTier = (score: number) => {
    if (score >= 950) return { tier: 'Perfect!', color: 'bg-green-500' }
    if (score >= 800) return { tier: 'Excellent', color: 'bg-blue-500' }
    if (score >= 600) return { tier: 'Great', color: 'bg-purple-500' }
    if (score >= 400) return { tier: 'Good', color: 'bg-yellow-500' }
    if (score >= 200) return { tier: 'Fair', color: 'bg-orange-500' }
    return { tier: 'Miss', color: 'bg-red-500' }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                {city} Leaderboard
              </CardTitle>
              <p className="text-sm text-gray-600">Top players in {city}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* User Best Score */}
          {userBestScore && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      YOU
                    </div>
                    <div>
                      <div className="font-semibold">Your Best Score in {city}</div>
                      <div className="text-sm text-gray-600">
                        {formatDistance(userBestScore.distance)} • {formatTimestamp(userBestScore.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatScore(userBestScore.score)}
                    </div>
                    <Badge className={getScoreTier(userBestScore.score).color}>
                      {getScoreTier(userBestScore.score).tier}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" />
              <span className="ml-2 text-gray-600">Loading leaderboard...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={loadCityLeaderboard} className="mt-2">
                Try Again
              </Button>
            </div>
          )}

          {/* Leaderboard */}
          {!loading && !error && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No scores yet for {city}. Be the first to play!</p>
                </div>
              ) : (
                leaderboard.map((entry, index) => (
                  <Card key={entry._id} className={`${index < 3 ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(entry.rank || index + 1)}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                            {entry.firstName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {entry.firstName} {entry.lastName || ''}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(entry.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {formatScore(entry.score)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDistance(entry.distance)}
                          </div>
                          <Badge className={`text-xs ${getScoreTier(entry.score).color}`}>
                            {getScoreTier(entry.score).tier}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
