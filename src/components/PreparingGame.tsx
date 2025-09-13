import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, MapPin } from 'lucide-react'

interface PreparingGameProps {
  currentLocation: [number, number] | null
}

export const PreparingGame = memo(({ currentLocation }: PreparingGameProps) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <img src="/logo.svg" alt="Gebeta" className="w-8 h-8" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-black flex items-center justify-center gap-2">
          <MapPin className="w-6 h-6" />
          Preparing Game
        </CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Loading the map and setting up your challenge...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <p className="text-sm text-gray-600">Loading map tiles...</p>
        </div>
        
        {currentLocation && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Location selected: {currentLocation[1].toFixed(4)}, {currentLocation[0].toFixed(4)}
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Generating random location</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Loading map tiles</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span>Preparing challenge</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
))

PreparingGame.displayName = 'PreparingGame'
