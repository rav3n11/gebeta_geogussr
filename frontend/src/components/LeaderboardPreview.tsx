import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Spinner } from './ui/spinner'
import { apiClient } from '../utils/api'
import type { LeaderboardEntry } from '../utils/api'
import { Trophy, Medal, Award, MapPin, ChevronRight, RefreshCw } from 'lucide-react'
import { getUserAvatarUrl } from '../utils/dicebearAvatar'

interface LeaderboardPreviewProps {
  onViewFull: () => void
}

export default function LeaderboardPreview({ onViewFull }: LeaderboardPreviewProps) {
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTopScores()
  }, [])

  const loadTopScores = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const response = await apiClient.getGlobalLeaderboard(5, 'all')
      setTopScores(response.leaderboard)
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadTopScores(true)
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-3 h-3 text-black" />
    if (rank === 2) return <Medal className="w-3 h-3 text-gray-600" />
    if (rank === 3) return <Award className="w-3 h-3 text-gray-600" />
    return <span className="w-3 h-3 flex items-center justify-center text-xs font-bold text-gray-500">#{rank}</span>
  }

  const formatScore = (score: number) => {
    return score.toLocaleString()
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
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-1 font-medium">
            <Trophy className="w-4 h-4 text-black" />
            Top Scores
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-black"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onViewFull} className="flex items-center gap-1 text-xs text-gray-600 hover:text-black">
              View All
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <Spinner size="sm" />
            <span className="ml-2 text-xs text-gray-500">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center py-3 text-gray-500 text-xs">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={() => loadTopScores(true)} className="mt-2 text-xs">
              Retry
            </Button>
          </div>
        ) : topScores.length === 0 ? (
          <div className="text-center py-3 text-gray-500">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-gray-300" />
            <p className="text-xs">No scores yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {topScores.map((entry, index) => (
              <div key={entry._id} className="flex items-center justify-between p-2 rounded bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-4">
                    {getRankIcon(entry.rank || index + 1)}
                  </div>
                  <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                    <img 
                      src={entry.photo_url || getUserAvatarUrl(entry.firstName, entry.lastName)} 
                      alt={`${entry.firstName} avatar`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">
                      {entry.firstName} {entry.lastName || ''}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-2 h-2" />
                      {entry.city}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold">
                    {formatScore(entry.score)}
                  </div>
                  <Badge className={`text-xs ${getScoreTier(entry.score).color}`}>
                    {getScoreTier(entry.score).tier}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
