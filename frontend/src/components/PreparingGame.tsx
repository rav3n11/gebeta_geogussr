import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { MapPin } from 'lucide-react'

export const PreparingGame = memo(() => (
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
          <Spinner size="md" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Generating random location</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Loading map</span>
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
