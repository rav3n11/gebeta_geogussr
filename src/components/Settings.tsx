import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { X } from 'lucide-react'
import type { GameSettings } from '@/types/game'
import { AVAILABLE_CITIES } from '@/types/game'

interface SettingsProps {
  settings: GameSettings
  bestScore: number
  onClose: () => void
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void
  onToggleCity: (cityName: string) => void
  onSelectAllCities: () => void
  onClearAllCities: () => void
  onResetBestScore: () => void
  onResetToDefaults: () => void
}

export const Settings = memo(({ 
  settings, 
  bestScore, 
  onClose, 
  onUpdateSettings, 
  onToggleCity, 
  onSelectAllCities, 
  onClearAllCities, 
  onResetBestScore, 
  onResetToDefaults 
}: SettingsProps) => (
  <div className="fixed inset-0 bg-gray-50 flex items-center justify-center p-4 z-50">
    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold text-black">Settings</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-600 hover:text-black"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Settings */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">Game Timer</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Study Time: {settings.tileViewDuration} seconds
                </label>
                <Slider
                  value={[settings.tileViewDuration]}
                  onValueChange={([value]: number[]) => onUpdateSettings({ tileViewDuration: value })}
                  min={5}
                  max={30}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* City Selection */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-black">Select Cities</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSelectAllCities}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearAllCities}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Choose which cities can appear in the game. At least one city must be selected.
            </p>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {AVAILABLE_CITIES.map((city) => (
                <div key={city.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={city.name}
                    checked={settings.selectedCities.includes(city.name)}
                    onCheckedChange={() => onToggleCity(city.name)}
                    disabled={settings.selectedCities.length === 1 && settings.selectedCities.includes(city.name)}
                  />
                  <label
                    htmlFor={city.name}
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {city.name}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {settings.selectedCities.length} cities
            </p>
          </div>
        </div>

        {/* Reset Settings */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-black">Best Score: {bestScore}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetBestScore}
              className="text-xs"
            >
              Reset Best Score
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={onResetToDefaults}
            className="w-full"
          >
            Reset Settings to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
))

Settings.displayName = 'Settings'
