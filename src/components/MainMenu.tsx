import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation, Settings, Trophy } from 'lucide-react'

interface MainMenuProps {
  onStartGame: () => void
  onOpenSettings: () => void
  bestScore: number
}

export const MainMenu = memo(({ onStartGame, onOpenSettings, bestScore }: MainMenuProps) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-between items-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
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
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={onStartGame} 
          size="lg" 
          className="w-full h-12 text-lg font-semibold bg-black text-white hover:bg-gray-800"
        >
          <Navigation className="w-5 h-5 mr-2" />
          Start Game
        </Button>
        <div className="flex justify-center space-x-2 text-sm text-gray-600">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Best Score: {bestScore}
          </Badge>
        </div>
        <div className="flex justify-center mt-4">
          <span className="text-xs text-gray-400">Powered by Gebeta</span>
        </div>
      </CardContent>
    </Card>
  </div>
))

MainMenu.displayName = 'MainMenu'
