import { memo, forwardRef } from 'react'
import GebetaMap from '@gebeta/tiles'
import type { GebetaMapRef } from '@gebeta/tiles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { MapPin } from 'lucide-react'
import { gebetaMapsApiKey } from '../config/env'

interface MapViewProps {
  currentMarker: [number, number] | null
  isSubmitting: boolean
  onMapClick: (lngLat: [number, number]) => void
  onSubmitGuess: () => void
  onMapLoad?: () => void
}

const MapViewComponent = forwardRef<GebetaMapRef, MapViewProps>(({ 
  currentMarker, 
  isSubmitting, 
  onMapClick, 
  onSubmitGuess,
  onMapLoad
}, ref) => {
  
  return (
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
                  <Spinner size="sm" className="border-white border-t-transparent mr-2" />
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
        apiKey={gebetaMapsApiKey}
        center={[38.7685, 9.0161]}
        zoom={6}
        onMapClick={onMapClick}
               onMapLoaded={() => {
                 if (onMapLoad) onMapLoad()
               }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
})

MapViewComponent.displayName = 'MapView'

export const MapView = memo(MapViewComponent)
