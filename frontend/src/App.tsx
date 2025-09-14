import { useRef, useEffect, useState, useCallback } from 'react'
import type { GebetaMapRef } from '@gebeta/tiles'
import { useGameState } from './hooks/useGameState'
import { getRandomCoordinates } from './utils/locations'
import type { GameSettings } from './types/game'
import { DEFAULT_SETTINGS, AVAILABLE_CITIES } from './types/game'
import { MainMenu } from './components/MainMenu'
import { PreparingGame } from './components/PreparingGame'
import { TileView } from './components/TileView'
import { MapView } from './components/MapView'
import { Results } from './components/Results'
import { Settings } from './components/Settings'
import CityLeaderboard from './components/CityLeaderboard'
import { TelegramProvider, useTelegram } from './contexts/TelegramContext'
import { apiClient } from './utils/api'

function AppContent() {
  const { webApp, user } = useTelegram()
  const mapRef = useRef<GebetaMapRef>(null)
  const { state, startGame, startTileView, showMap, setGuess, setLocation, showResults, resetGame } = useGameState()
  const [tileViewTimeLeft, setTileViewTimeLeft] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isLoadingRef = useRef(false)
  const timeLeftRef = useRef(0)
  const preparingTransitionRef = useRef(false)
  const [currentMarker, setCurrentMarker] = useState<[number, number] | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCityLeaderboard, setShowCityLeaderboard] = useState(false)
  const [selectedCityForLeaderboard, setSelectedCityForLeaderboard] = useState<string>('Addis Ababa')
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('gameSettings')
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
  })
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('bestScore')
    return saved ? parseInt(saved) : 0
  })
  const [cityScores, setCityScores] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('cityScores')
    return saved ? JSON.parse(saved) : {}
  })
  const [currentPlayingCity, setCurrentPlayingCity] = useState<string | null>(null)

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify(settings))
  }, [settings])

  // Track and save best score
  useEffect(() => {
    if (state.score > bestScore) {
      setBestScore(state.score)
      localStorage.setItem('bestScore', state.score.toString())
    }
  }, [state.score, bestScore])

  // Track and save city-specific scores
  useEffect(() => {
    if (currentPlayingCity && state.score > (cityScores[currentPlayingCity] || 0)) {
      const newCityScores = {
        ...cityScores,
        [currentPlayingCity]: state.score
      }
      setCityScores(newCityScores)
      localStorage.setItem('cityScores', JSON.stringify(newCityScores))
    }
  }, [state.score, currentPlayingCity, cityScores])

  // Submit score to backend when game ends
  useEffect(() => {
    if (state.phase === 'results' && state.currentLocation && state.userGuess && webApp && user) {
      const submitScore = async () => {
        try {
          const initData = webApp.initData
          const city = currentPlayingCity || 'Random'
          const gameMode = currentPlayingCity ? 'city' : 'random'
          
          await apiClient.submitScore({
            score: state.score,
            city,
            gameMode,
            distance: state.distance || 0,
            roundScore: state.roundScore || 0
          }, initData)
          
          console.log('Score submitted successfully!')
        } catch (error) {
          console.error('Failed to submit score:', error)
          // Don't show error to user, just log it
        }
      }
      
      submitScore()
    }
  }, [state.phase, state.currentLocation, state.userGuess, state.score, state.distance, state.roundScore, webApp, user, currentPlayingCity])

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const toggleCity = (cityName: string) => {
    setSettings(prev => ({
      ...prev,
      selectedCities: prev.selectedCities.includes(cityName)
        ? prev.selectedCities.filter(name => name !== cityName)
        : [...prev.selectedCities, cityName]
    }))
  }

  const resetBestScore = () => {
    setBestScore(0)
    localStorage.setItem('bestScore', '0')
  }

  const selectAllCities = () => {
    setSettings(prev => ({
      ...prev,
      selectedCities: AVAILABLE_CITIES.map(city => city.name)
    }))
  }

  const clearAllCities = () => {
    setSettings(prev => ({
      ...prev,
      selectedCities: [AVAILABLE_CITIES[0].name] // Keep at least one city
    }))
  }

  // Set a target location when preparing phase starts
  useEffect(() => {
    if (state.phase === 'preparing' && !hasStarted) {
      console.log('Preparing phase: setting location')
      setHasStarted(true)
      const randomLocation = getRandomCoordinates(settings.selectedCities)
      console.log('Random location:', randomLocation)
      setLocation(randomLocation)
    }
  }, [state.phase, hasStarted, setLocation])

  // Transition from preparing to tile-view after delay
  useEffect(() => {
    if (state.phase === 'preparing' && hasStarted && state.currentLocation && !preparingTransitionRef.current) {
      console.log('Starting preparing transition timer')
      preparingTransitionRef.current = true
      
      const timer = setTimeout(() => {
        console.log('Transitioning to tile-view')
        startTileView()
        setIsLoading(true)
        isLoadingRef.current = true
      }, 1500) // 1.5 second delay to show preparing phase
      
      return () => {
        console.log('Cleaning up preparing timer')
        clearTimeout(timer)
      }
    }
  }, [state.phase, hasStarted, state.currentLocation, startTileView])

  // Handle tile view timer - start countdown when tile view begins
  useEffect(() => {
    console.log('Tile-view useEffect triggered:', { 
      phase: state.phase, 
      hasStarted, 
      isLoadingRef: isLoadingRef.current 
    })
    if (state.phase === 'tile-view' && hasStarted && isLoadingRef.current) {
      console.log('Tile-view phase: starting countdown')
      setIsLoading(false)
      isLoadingRef.current = false
      preparingTransitionRef.current = false // Reset transition flag for next game
      
      // Clear any existing timer first
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      timeLeftRef.current = settings.tileViewDuration
      setTileViewTimeLeft(settings.tileViewDuration)
      
      timerRef.current = setInterval(() => {
        timeLeftRef.current -= 1
        
        // Only update state every second to avoid excessive re-renders
        setTileViewTimeLeft(timeLeftRef.current)
        
        if (timeLeftRef.current <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          showMap()
        }
      }, 1000)
    }
  }, [state.phase, hasStarted, settings.tileViewDuration])

  // Cleanup timer on unmount or phase change
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state.phase])

  // Reset hasStarted when returning to menu
  useEffect(() => {
    if (state.phase === 'menu') {
      setHasStarted(false)
      setTileViewTimeLeft(0)
      setCurrentMarker(null)
      setMapLoaded(false)
      setIsSubmitting(false)
      setIsLoading(false)
      isLoadingRef.current = false
      preparingTransitionRef.current = false // Reset transition flag
      
      // Clear any running timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state.phase])


  // Draw results visualization
  useEffect(() => {
    if (state.phase === 'results' && state.currentLocation && state.userGuess && mapRef.current && mapLoaded) {
      // Add a small delay to ensure map style is fully loaded
      const addResultsVisualization = () => {
        if (!mapRef.current) return
        
        try {
          // Clear previous markers and paths
          mapRef.current.clearMarkers()
          mapRef.current.clearPaths()
          
          // Add actual location marker (green)
          mapRef.current.addImageMarker(
            state.currentLocation!,
            '/pin.png',
            [30, 30],
            () => console.log('Actual location clicked!'),
            10,
            '<b>🎯 Actual Location</b>'
          )
          
          // Add user guess marker (red)
          mapRef.current.addImageMarker(
            state.userGuess!,
            '/pin.png',
            [30, 30],
            () => console.log('Your guess clicked!'),
            10,
            '<b>📍 Your Guess</b>'
          )
          
          // Add path between points
          const path = [state.userGuess!, state.currentLocation!]
          mapRef.current.addPath(path, {
            color: '#ff4444',
            width: 3,
            opacity: 0.8
          })
          
          console.log('Results visualization added successfully')
        } catch (error) {
          setTimeout(addResultsVisualization, 100)
        }
      }
      
      // Start the visualization process
      addResultsVisualization()
    }
  }, [state.phase, state.currentLocation, state.userGuess, mapLoaded])

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true)
  }, [])


  const handleStartGame = useCallback(() => {
    console.log('Starting game - resetting state')
    setCurrentPlayingCity(null) // Reset to random play
    setHasStarted(false) // Reset to allow new location selection
    preparingTransitionRef.current = false // Reset transition flag
    
    // Reset all local state
    setTileViewTimeLeft(0)
    setCurrentMarker(null)
    setMapLoaded(false)
    setIsSubmitting(false)
    setIsLoading(false)
    isLoadingRef.current = false
    
    // Clear any running timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    startGame()
  }, [startGame])

  const handleStartSpecificCity = useCallback((cityName: string) => {
    setCurrentPlayingCity(cityName)
    setHasStarted(false) // Reset to allow new location selection
    preparingTransitionRef.current = false // Reset transition flag
    
    // Reset all local state
    setTileViewTimeLeft(0)
    setCurrentMarker(null)
    setMapLoaded(false)
    setIsSubmitting(false)
    setIsLoading(false)
    isLoadingRef.current = false
    
    // Clear any running timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    // Set the selected city in settings temporarily
    const citySettings = {
      ...settings,
      selectedCities: [cityName]
    }
    setSettings(citySettings)
    startGame()
  }, [settings, startGame])

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true)
  }, [])

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false)
  }, [])


  const handleOpenCityLeaderboard = useCallback((city: string) => {
    setSelectedCityForLeaderboard(city)
    setShowCityLeaderboard(true)
  }, [])

  const handleCloseCityLeaderboard = useCallback(() => {
    setShowCityLeaderboard(false)
  }, [])

  const handleMapClick = useCallback((lngLat: [number, number]) => {
    if (state.phase === 'map-view') {
      setCurrentMarker(lngLat)
      
      // Add marker to the map using addImageMarker with custom icon
      if (mapRef.current) {
        mapRef.current.clearMarkers()
        mapRef.current.addImageMarker(
          lngLat,
          '/pin.png', // Local pin icon
          [30, 30], // Size
          () => console.log('Marker clicked!'), // Click handler
          10, // Z-index
          '<b>Your Guess</b>' // Popup HTML
        )
      }
    }
  }, [state.phase])

  const handleSubmitGuess = useCallback(() => {
    if (currentMarker && state.phase === 'map-view' && !isSubmitting) {
      setIsSubmitting(true)
      setGuess(currentMarker)
      showResults(currentMarker)
    }
  }, [currentMarker, state.phase, isSubmitting, setGuess, showResults])

  const handlePlayAgain = useCallback(() => {
    // Reset all local state
    setHasStarted(false)
    setTileViewTimeLeft(0)
    setCurrentMarker(null)
    setMapLoaded(false)
    setIsSubmitting(false)
    setIsLoading(false)
    isLoadingRef.current = false
    preparingTransitionRef.current = false // Reset transition flag
    
    // Clear any running timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    // Reset game state first
    resetGame()
    
    // If playing a specific city, replay the same city
    if (currentPlayingCity) {
      const citySettings = {
        ...settings,
        selectedCities: [currentPlayingCity]
      }
      setSettings(citySettings)
    } else {
      setCurrentPlayingCity(null)
    }
    
    // Start new game
    startGame()
  }, [resetGame, startGame, currentPlayingCity, settings])

  const handleMainMenu = useCallback(() => {
    // Reset all game state
    setHasStarted(false)
    setTileViewTimeLeft(0)
    setCurrentMarker(null)
    setMapLoaded(false)
    setIsSubmitting(false)
    setIsLoading(false)
    isLoadingRef.current = false
    preparingTransitionRef.current = false // Reset transition flag
    
    // Clear any running timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    // Reset game state to menu using the hook
    resetGame()
  }, [resetGame])




  return (
    <div className="min-h-screen bg-gray-50">
      {state.phase === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onStartSpecificCity={handleStartSpecificCity}
          onOpenSettings={handleOpenSettings}
          onOpenCityLeaderboard={handleOpenCityLeaderboard}
          bestScore={bestScore}
          cityScores={cityScores}
        />
      )}
      {(state.phase === 'preparing' || state.phase === 'tile-view') && (
        <div className="relative">
          {state.phase === 'preparing' && (
            <div className="absolute inset-0 z-20">
              <PreparingGame />
            </div>
          )}
          <TileView
            ref={mapRef}
            currentLocation={state.currentLocation}
            isLoading={isLoading}
            timeLeft={tileViewTimeLeft}
            onMapLoad={handleMapLoad}
            showOverlay={state.phase === 'preparing'}
          />
        </div>
      )}
      {state.phase === 'map-view' && (
        <MapView
          ref={mapRef}
          currentMarker={currentMarker}
          isSubmitting={isSubmitting}
          onMapClick={handleMapClick}
          onSubmitGuess={handleSubmitGuess}
          onMapLoad={handleMapLoad}
        />
      )}
      {state.phase === 'results' && (
        <Results
          ref={mapRef}
          currentLocation={state.currentLocation}
          userGuess={state.userGuess}
          distance={state.distance}
          roundScore={state.roundScore}
          score={state.score}
          bestScore={bestScore}
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleMainMenu}
        />
      )}
      {showSettings && (
        <Settings
          settings={settings}
          bestScore={bestScore}
          onClose={handleCloseSettings}
          onUpdateSettings={updateSettings}
          onToggleCity={toggleCity}
          onSelectAllCities={selectAllCities}
          onClearAllCities={clearAllCities}
          onResetBestScore={resetBestScore}
          onResetToDefaults={() => setSettings(DEFAULT_SETTINGS)}
        />
      )}
      {showCityLeaderboard && (
        <CityLeaderboard 
          city={selectedCityForLeaderboard} 
          onClose={handleCloseCityLeaderboard} 
        />
      )}
    </div>
  )
}

function App() {
  return (
    <TelegramProvider>
      <AppContent />
    </TelegramProvider>
  )
}

export default App
