import { memo, forwardRef } from 'react'
import GebetaMap from '@gebeta/tiles'
import type { GebetaMapRef } from '@gebeta/tiles'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Target } from 'lucide-react'
import { gebetaMapsApiKey } from '../config/env'

interface TileViewProps {
  currentLocation: [number, number] | null
  isLoading: boolean
  timeLeft: number
  onMapLoad: () => void
  showOverlay?: boolean
}

export const TileView = memo(forwardRef<GebetaMapRef, TileViewProps>(({ 
  currentLocation, 
  isLoading, 
  timeLeft, 
  onMapLoad,
  showOverlay = false
}, ref) => (
  <div className="relative w-full h-screen overflow-hidden bg-gray-50">
    {!showOverlay && (
      <Card className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-auto sm:max-w-sm z-10 shadow-lg frosted-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl flex items-center justify-between text-black">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-black" />
              Memorize this place...
            </div>
            {timeLeft > 0 && (
              <div className="text-2xl font-bold text-black">
                {timeLeft}
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-gray-600">
            You'll need to find this place on the map!
          </CardDescription>
        </CardHeader>
        {isLoading && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-center space-x-2">
              <Spinner size="md" />
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </CardContent>
        )}
      </Card>
    )}
    <GebetaMap
      ref={ref}
      apiKey={gebetaMapsApiKey}
      center={currentLocation || [38.7685, 9.0161]}
      zoom={15}
      style={{ width: '100%', height: '100%' }}
      onMapLoaded={onMapLoad}
      blockInteractions={true}
    />
    {/* Center marker to show exact location to guess */}
    {currentLocation && (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <img 
          src="/pin.png" 
          alt="Target location" 
          className="w-8 h-8 animate-pulse drop-shadow-lg"
        />
      </div>
    )}
  </div>
)))

TileView.displayName = 'TileView'
