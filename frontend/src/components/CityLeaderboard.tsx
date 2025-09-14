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
    if (rank === 1) return <Trophy className="w-4 h-4 text-black" />
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-600" />
    if (rank === 3) return <Award className="w-4 h-4 text-gray-600" />
    return <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-gray-500">#{rank}</span>
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
    if (score >= 950) return { tier: 'Perfect!', color: 'bg-black text-white' }
    if (score >= 800) return { tier: 'Excellent', color: 'bg-gray-800 text-white' }
    if (score >= 600) return { tier: 'Great', color: 'bg-gray-600 text-white' }
    if (score >= 400) return { tier: 'Good', color: 'bg-gray-400 text-black' }
    if (score >= 200) return { tier: 'Fair', color: 'bg-gray-300 text-black' }
    return { tier: 'Miss', color: 'bg-gray-200 text-black' }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-600 hover:text-black">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <CardTitle className="text-lg font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4 text-black" />
                {city} Leaderboard
              </CardTitle>
              <p className="text-xs text-gray-600">Top players in {city}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* User Best Score */}
          {userBestScore && (
            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">
                      YOU
                    </div>
                    <div>
                      <div className="text-sm font-medium">Your Best Score in {city}</div>
                      <div className="text-xs text-gray-600">
                        {formatDistance(userBestScore.distance)} • {formatTimestamp(userBestScore.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-black">
                      {formatScore(userBestScore.score)}
                    </div>
                    <Badge className={`text-xs ${getScoreTier(userBestScore.score).color}`}>
                      {getScoreTier(userBestScore.score).tier}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Spinner size="md" />
              <span className="ml-2 text-sm text-gray-600">Loading...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-6 text-gray-600">
              <p className="text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={loadCityLeaderboard} className="mt-2 text-xs">
                Try Again
              </Button>
            </div>
          )}

          {/* Leaderboard */}
          {!loading && !error && (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {leaderboard.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No scores yet for {city}. Be the first to play!</p>
                </div>
              ) : (
                leaderboard.map((entry, index) => (
                  <Card key={entry._id} className={`${index < 3 ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6">
                            {getRankIcon(entry.rank || index + 1)}
                          </div>
                          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                            {entry.photo_url ? (
                              <img 
                                src={entry.photo_url} 
                                alt={`${entry.firstName} avatar`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                {entry.firstName?.charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">
                              {entry.firstName} {entry.lastName || ''}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(entry.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-black">
                            {formatScore(entry.score)}
                          </div>
                          <div className="text-xs text-gray-600">
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
