import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Spinner } from './ui/spinner'
import { apiClient } from '../utils/api'
import type { LeaderboardEntry } from '../utils/api'
import { Trophy, Medal, Award, MapPin, ChevronRight } from 'lucide-react'

interface LeaderboardPreviewProps {
  onViewFull: () => void
}

export default function LeaderboardPreview({ onViewFull }: LeaderboardPreviewProps) {
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTopScores()
  }, [])

  const loadTopScores = async () => {
    try {
      const response = await apiClient.getGlobalLeaderboard(5, 'all')
      setTopScores(response.leaderboard)
    } catch (err) {
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />
    if (rank === 3) return <Award className="w-4 h-4 text-amber-600" />
    return <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-gray-500">#{rank}</span>
  }

  const formatScore = (score: number) => {
    return score.toLocaleString()
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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Scores
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewFull} className="flex items-center gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Spinner size="md" />
            <span className="ml-2 text-sm text-gray-500">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500 text-sm">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={loadTopScores} className="mt-2">
              Retry
            </Button>
          </div>
        ) : topScores.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No scores yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topScores.map((entry, index) => (
              <div key={entry._id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6">
                    {getRankIcon(entry.rank || index + 1)}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                    {entry.firstName?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {entry.firstName} {entry.lastName || ''}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {entry.city}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">
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
