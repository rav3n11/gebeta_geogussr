import { memo, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation, Settings, Trophy, MapPin, ArrowLeft, User } from 'lucide-react'
import { CityCarousel } from './CityCarousel'
import LeaderboardPreview from './LeaderboardPreview'
import Leaderboard from './Leaderboard'
import { useTelegram } from '../contexts/TelegramContext'

interface MainMenuProps {
  onStartGame: () => void
  onStartSpecificCity: (cityName: string) => void
  onOpenSettings: () => void
  onOpenCityLeaderboard: (cityName: string) => void
  bestScore: number
  cityScores: Record<string, number>
}

export const MainMenu = memo(({ onStartGame, onStartSpecificCity, onOpenSettings, onOpenCityLeaderboard, bestScore, cityScores }: MainMenuProps) => {
  const [showCitySelection, setShowCitySelection] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const { user, hapticFeedback } = useTelegram()

  // Refresh leaderboard when returning to main menu
  useEffect(() => {
    if (!showCitySelection && !showLeaderboard) {
      setLeaderboardKey(prev => prev + 1)
    }
  }, [showCitySelection, showLeaderboard])

  const handleCitySelect = (cityName: string) => {
    hapticFeedback.selectionChanged()
    onStartSpecificCity(cityName)
    setShowCitySelection(false)
  }

  const handleStartGame = () => {
    hapticFeedback.impactOccurred('medium')
    onStartGame()
  }

  const handleOpenSettings = () => {
    hapticFeedback.selectionChanged()
    onOpenSettings()
  }

  const handleShowCitySelection = () => {
    hapticFeedback.selectionChanged()
    setShowCitySelection(true)
  }

  const handleOpenLeaderboard = () => {
    hapticFeedback.selectionChanged()
    setShowLeaderboard(true)
  }

  const handleCloseLeaderboard = () => {
    hapticFeedback.selectionChanged()
    setShowLeaderboard(false)
  }

  if (showCitySelection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCitySelection(false)}
                className="text-gray-600 hover:text-black"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Choose a City
              </CardTitle>
            </div>
            <CardDescription className="text-gray-600 mt-3">
              Select a city to play a specific location
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <CityCarousel
              onPlayCity={handleCitySelect}
              onViewLeaderboard={onOpenCityLeaderboard}
              cityScores={cityScores}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseLeaderboard}
                className="text-gray-600 hover:text-black"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Leaderboard
              </CardTitle>
            </div>
            <CardDescription className="text-gray-600 mt-3">
              View global and city-specific rankings
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Leaderboard onClose={handleCloseLeaderboard} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-between items-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenSettings}
              className="text-gray-600 hover:text-black"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center">
              <img src="/logo.svg" alt="Gebeta" className="w-8 h-8" />
            </div>
            <div className="w-8" /> {/* Spacer for alignment */}
          </div>
          <CardTitle className="text-3xl font-bold text-black">
            Guess the Place
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Can you recognize a corner of Ethiopia just from its roads?
          </CardDescription>

          {/* User Info */}
          {user && (
            <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Welcome, {user.first_name}
                {user.username && user.id !== 999999999 && ` (@${user.username})`}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleStartGame}
            size="lg"
            className="w-full h-12 text-lg font-semibold bg-black text-white hover:bg-gray-800"
          >
            <Navigation className="w-5 h-5 mr-2" />
            Random Place
          </Button>

          <Button
            onClick={handleShowCitySelection}
            variant="outline"
            size="lg"
            className="w-full h-12 text-lg font-semibold"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Choose City
          </Button>

          <div className="flex justify-center space-x-2 text-sm text-gray-600">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Best Score: {bestScore}
            </Badge>
          </div>

          {/* Leaderboard Preview */}
          <LeaderboardPreview key={leaderboardKey} onViewFull={handleOpenLeaderboard} />

          <div className="flex justify-center mt-4">
            <span className="text-xs text-gray-400">Powered by Gebeta</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

MainMenu.displayName = 'MainMenu'
