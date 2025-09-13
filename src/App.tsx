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

function App() {
  const mapRef = useRef<GebetaMapRef>(null)
  const { state, startGame, startTileView, showMap, setGuess, setLocation, showResults } = useGameState()
  const [tileViewTimeLeft, setTileViewTimeLeft] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isLoadingRef = useRef(false)
  const timeLeftRef = useRef(0)
  const [currentMarker, setCurrentMarker] = useState<[number, number] | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('gameSettings')
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
  })
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('bestScore')
    return saved ? parseInt(saved) : 0
  })

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

  // Set a target location when preparing phase starts (only once)
  useEffect(() => {
    if (state.phase === 'preparing' && !hasStarted) {
      setHasStarted(true)
      const randomLocation = getRandomCoordinates(settings.selectedCities)
      setLocation(randomLocation)
    }
  }, [state.phase, hasStarted, setLocation])

  // Transition from preparing to tile-view when map loads
  useEffect(() => {
    if (state.phase === 'preparing' && mapLoaded && state.currentLocation) {
      // Add a small delay to show the preparing phase
      const timer = setTimeout(() => {
        startTileView()
        setIsLoading(true)
        isLoadingRef.current = true
      }, 1500) // 1.5 second delay to show preparing phase
      
      return () => clearTimeout(timer)
    }
  }, [state.phase, mapLoaded, state.currentLocation, startTileView])

  // Handle tile view timer - wait for map to load, then countdown
  useEffect(() => {
    if (state.phase === 'tile-view' && hasStarted && mapLoaded && isLoadingRef.current) {
      setIsLoading(false)
      isLoadingRef.current = false
      
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
  }, [state.phase, hasStarted, mapLoaded, settings.tileViewDuration])

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
    startGame()
  }, [startGame])

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true)
  }, [])

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false)
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
    // Reset game state and start a new game
    setHasStarted(false)
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

  const handleMainMenu = useCallback(() => {
    // Reset all game state
    setHasStarted(false)
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
    
    // Reset game state to menu
    window.location.reload()
  }, [])




  return (
    <div className="min-h-screen bg-gray-50">
      {state.phase === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenSettings={handleOpenSettings}
          bestScore={bestScore}
        />
      )}
      {(state.phase === 'preparing' || state.phase === 'tile-view') && (
        <div className="relative">
          {state.phase === 'preparing' && (
            <div className="absolute inset-0 z-20">
              <PreparingGame
                currentLocation={state.currentLocation}
              />
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
    </div>
  )
}

export default App
