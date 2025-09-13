import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Play } from 'lucide-react'
import { AVAILABLE_CITIES } from '../types/game'

interface CityCarouselProps {
  onPlayCity: (cityName: string) => void
  cityScores: Record<string, number>
}

export const CityCarousel = memo(({ onPlayCity, cityScores }: CityCarouselProps) => {
  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" style={{ scrollSnapType: 'x mandatory' }}>
          {AVAILABLE_CITIES.map((city) => {
            const cityScore = cityScores?.[city.name] || 0
            return (
              <Card 
                key={city.name} 
                className="flex-shrink-0 w-64 h-42 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 cursor-pointer group flex flex-col snap-start"
                onClick={() => onPlayCity(city.name)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800 text-center">
                    {city.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-gray-800">
                        {cityScore.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full bg-black text-white hover:bg-gray-800 group-hover:bg-gray-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPlayCity(city.name)
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                </CardContent>
              </Card>
            )
          })}
          
          {/* More cities coming soon entry */}
          <div className="flex-shrink-0 w-64 h-42 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg snap-start">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">⋯</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">More Cities</h3>
                <p className="text-sm text-gray-500">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

CityCarousel.displayName = 'CityCarousel'
