import { memo, forwardRef, useState } from 'react'
import GebetaMap from '@gebeta/tiles'
import type { GebetaMapRef } from '@gebeta/tiles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, RotateCcw, Share2, Download } from 'lucide-react'
import { getScoreTier } from '../utils/distance'
import { gebetaMapsApiKey } from '../config/env'
import { shareImage, downloadShareImage } from '../utils/shareImage'
import { useTelegram } from '../contexts/TelegramContext'

interface ResultsProps {
  currentLocation: [number, number] | null
  userGuess: [number, number] | null
  distance: number | null
  roundScore: number | null
  score: number
  bestScore: number
  onPlayAgain: () => void
  onMainMenu: () => void
  submitError?: string | null
}

// Calculate center point and zoom to fit both markers
const calculateBounds = (point1: [number, number], point2: [number, number]) => {
  const lngs = [point1[0], point2[0]]
  const lats = [point1[1], point2[1]]
  
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  
  return {
    center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2] as [number, number],
    zoom: Math.min(12, Math.max(6, 15 - Math.log2(Math.max(maxLng - minLng, maxLat - minLat) * 100)))
  }
}

const ResultsComponent = forwardRef<GebetaMapRef, ResultsProps>(({ 
  currentLocation,
  userGuess,
  distance,
  roundScore,
  score,
  bestScore,
  onPlayAgain,
  onMainMenu,
  submitError
}, ref) => {
  const [isSharing, setIsSharing] = useState(false)
  const { user, hapticFeedback, webApp } = useTelegram()
  
  const bounds = currentLocation && userGuess 
    ? calculateBounds(currentLocation, userGuess)
    : { center: [38.7685, 9.0161] as [number, number], zoom: 6 }

  const handleShare = async () => {
    if (!user) return
    
    try {
      setIsSharing(true)
      hapticFeedback.impactOccurred('medium')
      
      const tier = distance != null ? getScoreTier(distance) : { tier: 'Unknown', color: '#64748b', description: 'No distance calculated' }
      
      await shareImage({
        userName: user.first_name,
        score,
        distance,
        roundScore,
        tier,
        isNewBest: score > bestScore
      })
      
      hapticFeedback.notificationOccurred('success')
    } catch (error) {
      console.error('Error sharing:', error)
      hapticFeedback.notificationOccurred('error')
    } finally {
      setIsSharing(false)
    }
  }

  const handleDownload = async () => {
    if (!user) return
    
    try {
      setIsSharing(true)
      hapticFeedback.impactOccurred('medium')
      
      const tier = distance != null ? getScoreTier(distance) : { tier: 'Unknown', color: '#64748b', description: 'No distance calculated' }
      
      const { generateShareImage } = await import('../utils/shareImage')
      const dataUrl = await generateShareImage({
        userName: user.first_name,
        score,
        distance,
        roundScore,
        tier,
        isNewBest: score > bestScore
      })
      
      downloadShareImage(dataUrl, `gebeta-score-${user.first_name}-${score}.png`)
      hapticFeedback.notificationOccurred('success')
    } catch (error) {
      console.error('Error downloading:', error)
      hapticFeedback.notificationOccurred('error')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      <Card className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-auto sm:max-w-sm z-10 shadow-lg frosted-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-black">
            <Trophy className="w-5 h-5 text-black" />
            Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score Tier Display */}
          {distance != null && (
            <div className="text-center space-y-2">
              {(() => {
                const tier = getScoreTier(distance);
                return (
                  <>
                    <div className={`text-2xl font-bold ${tier.color}`}>
                      {tier.tier}
                    </div>
                    <div className="text-sm text-gray-600">
                      {tier.description}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
          
          <div className="space-y-2">
            {distance != null && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Distance:</span>
                <Badge variant="outline" className="font-mono">
                  {distance.toFixed(1)} km
                </Badge>
              </div>
            )}
            {roundScore !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Round Score:</span>
                <Badge variant="secondary" className="font-mono">
                  {roundScore} pts
                </Badge>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-gray-200 pt-2">
              <span className="text-sm font-medium text-black">Total Score:</span>
              <div className="flex items-center gap-2">
                <Badge className="font-mono bg-black text-white">
                  {score} pts
                </Badge>
                {score > bestScore && (
                  <Badge className="font-mono bg-green-600 text-white">
                    New Best!
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Button 
              onClick={onPlayAgain} 
              className="w-full bg-black text-white hover:bg-gray-800"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            
            {/* Share buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleShare}
                disabled={isSharing || !user}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {isSharing ? 'Sharing...' : 'Share'}
              </Button>
              {/* Only show download button in regular browsers, not in Telegram */}
              {!webApp && (
                <Button 
                  onClick={handleDownload}
                  disabled={isSharing || !user}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isSharing ? 'Generating...' : 'Download'}
                </Button>
              )}
            </div>
            
            <Button 
              onClick={onMainMenu} 
              variant="outline"
              className="w-full"
              size="lg"
            >
              Main Menu
            </Button>
          </div>
          
          {/* Error message */}
          {submitError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-600 text-center">{submitError}</p>
            </div>
          )}
        </CardContent>
      </Card>
      <GebetaMap
        ref={ref}
        apiKey={gebetaMapsApiKey}
        center={bounds.center}
        zoom={bounds.zoom}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
})

ResultsComponent.displayName = 'Results'

export const Results = memo(ResultsComponent)
