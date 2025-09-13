import { memo, forwardRef } from 'react'
import GebetaMap from '@gebeta/tiles'
import type { GebetaMapRef } from '@gebeta/tiles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

interface MapViewProps {
  currentMarker: [number, number] | null
  isSubmitting: boolean
  onMapClick: (lngLat: [number, number]) => void
  onSubmitGuess: () => void
}

export const MapView = memo(forwardRef<GebetaMapRef, MapViewProps>(({ 
  currentMarker, 
  isSubmitting, 
  onMapClick, 
  onSubmitGuess 
}, ref) => (
  <div className="relative w-full h-screen overflow-hidden bg-gray-50">
    <Card className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-auto sm:max-w-sm z-10 shadow-lg frosted-glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-black">
          <MapPin className="w-5 h-5 text-black" />
          Place your guess!
        </CardTitle>
        <CardDescription className="text-gray-600">
          Click on the map to place your marker, then click Submit
        </CardDescription>
      </CardHeader>
      {currentMarker && (
        <CardContent className="pt-0">
          <Button 
            key={`submit-${currentMarker[0]}-${currentMarker[1]}`}
            onClick={onSubmitGuess} 
            disabled={isSubmitting}
            className="w-full bg-black text-white hover:bg-gray-800"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Guess'
            )}
          </Button>
        </CardContent>
      )}
    </Card>
    <GebetaMap
      ref={ref}
      apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
      center={[38.7685, 9.0161]}
      zoom={6}
      onMapClick={onMapClick}
      style={{ width: '100%', height: '100%' }}
    />
  </div>
)))

MapView.displayName = 'MapView'
