import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Spinner } from './ui/spinner'
import { apiClient } from '../utils/api'
import type { LeaderboardEntry, LeaderboardResponse } from '../utils/api'
import { useTelegram } from '../contexts/TelegramContext'
import { Trophy, Medal, Award, Users, MapPin, Clock, Target } from 'lucide-react'

interface LeaderboardProps {
  onClose: () => void
}

type LeaderboardType = 'global' | 'city' | 'user'
type GameMode = 'random' | 'city' | 'all'

export default function Leaderboard({ }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('global')
  const [gameMode, setGameMode] = useState<GameMode>('all')
  const [selectedCity, setSelectedCity] = useState<string>('Addis Ababa')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userBestScore, setUserBestScore] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useTelegram()

  const cities = [
    'Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Gondar', 'Mekelle',
    'Hawassa', 'Jimma', 'Harar', 'Jijiga', 'Arba Minch'
  ]

  useEffect(() => {
    loadLeaderboard()
  }, [activeTab, gameMode, selectedCity])

  const loadLeaderboard = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let response: LeaderboardResponse
      
      switch (activeTab) {
        case 'global':
          response = await apiClient.getGlobalLeaderboard(100, gameMode === 'all' ? undefined : gameMode)
          break
        case 'city':
          response = await apiClient.getCityLeaderboard(selectedCity, 50)
          break
        case 'user':
          if (user?.id) {
            response = await apiClient.getUserLeaderboard(user.id, 100)
          } else {
            setError('User not authenticated')
            return
          }
          break
        default:
          return
      }
      
      setLeaderboard(response.leaderboard)
      setUserBestScore(response.userBestScore || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
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
    <div className="space-y-4">
          {/* Tabs */}
          <div className="flex space-x-2 border-b">
            {[
              { key: 'global', label: 'Global', icon: Users },
              { key: 'city', label: 'City', icon: MapPin },
              { key: 'user', label: 'My Scores', icon: Target }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeTab === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(key as LeaderboardType)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {activeTab === 'global' && (
              <div className="flex gap-2">
                {['all', 'random', 'city'].map((mode) => (
                  <Button
                    key={mode}
                    variant={gameMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGameMode(mode as GameMode)}
                  >
                    {mode === 'all' ? 'All Games' : mode === 'random' ? 'Random' : 'City'}
                  </Button>
                ))}
              </div>
            )}
            
            {activeTab === 'city' && (
              <div className="flex gap-2">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

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
                      <div className="font-semibold">Your Best Score</div>
                      <div className="text-sm text-gray-600">
                        {userBestScore.city} • {formatDistance(userBestScore.distance)}
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
              <Button variant="outline" size="sm" onClick={loadLeaderboard} className="mt-2">
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
                  <p>No scores yet. Be the first to play!</p>
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
                              <MapPin className="w-3 h-3" />
                              {entry.city}
                              <Clock className="w-3 h-3 ml-2" />
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
    </div>
  )
}
