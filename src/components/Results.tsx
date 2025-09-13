import { memo, forwardRef } from 'react'
import GebetaMap from '@gebeta/tiles'
import type { GebetaMapRef } from '@gebeta/tiles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, RotateCcw } from 'lucide-react'
import { getScoreTier } from '../utils/distance'
import { gebetaMapsApiKey } from '../config/env'

interface ResultsProps {
  currentLocation: [number, number] | null
  userGuess: [number, number] | null
  distance: number | null
  roundScore: number | null
  score: number
  bestScore: number
  onPlayAgain: () => void
  onMainMenu: () => void
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
  onMainMenu
}, ref) => {
  const bounds = currentLocation && userGuess 
    ? calculateBounds(currentLocation, userGuess)
    : { center: [38.7685, 9.0161] as [number, number], zoom: 6 }

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
            <Button 
              onClick={onMainMenu} 
              variant="outline"
              className="w-full"
              size="lg"
            >
              Main Menu
            </Button>
          </div>
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
