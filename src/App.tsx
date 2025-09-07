import { useRef, useEffect, useState } from 'react'
import GebetaMap from '@gebeta/tiles'
import type { GebetaMapRef } from '@gebeta/tiles'
import { useGameState } from './hooks/useGameState'
import { getRandomCoordinates } from './utils/locations'
import './App.css'

function App() {
  const mapRef = useRef<GebetaMapRef>(null)
  const { state, startGame, startCountdown, showMap, setGuess, setLocation, showResults } = useGameState()
  const [countdown, setCountdown] = useState(5)
  const [currentMarker, setCurrentMarker] = useState<[number, number] | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Set a target location when game starts (only once)
  useEffect(() => {
    if (state.phase === 'tile-view' && !hasStarted) {
      setHasStarted(true)
      setIsLoading(true)
      const randomLocation = getRandomCoordinates()
      setLocation(randomLocation)
    }
  }, [state.phase, hasStarted, setLocation])

  // Handle countdown timer separately - wait for map to load
  useEffect(() => {
    if (state.phase === 'tile-view' && hasStarted && mapLoaded) {
      setIsLoading(false)
      const timer = setTimeout(() => {
        startCountdown()
      }, 3000) // Show tile for 3 seconds before countdown

      return () => clearTimeout(timer)
    }
  }, [state.phase, hasStarted, mapLoaded, startCountdown])

  // Handle countdown countdown
  useEffect(() => {
    if (state.phase === 'countdown') {
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer)
            showMap()
            return 5
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdownTimer)
    }
  }, [state.phase, showMap])

  // Reset hasStarted when returning to menu
  useEffect(() => {
    if (state.phase === 'menu') {
      setHasStarted(false)
      setCountdown(5)
      setCurrentMarker(null)
      setMapLoaded(false)
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }, [state.phase])

  // Calculate bounds to fit both markers
  const calculateBounds = (point1: [number, number], point2: [number, number]) => {
    const lngs = [point1[0], point2[0]]
    const lats = [point1[1], point2[1]]
    
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    
    return {
      center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2] as [number, number],
      zoom: Math.min(12, Math.max(6, 15 - Math.log2(Math.max(maxLng - minLng, maxLat - minLat) * 100)))
    }
  }

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

  const handleMapLoad = () => {
    setMapLoaded(true)
  }

  const handleMapClick = (lngLat: [number, number]) => {
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
  }

  const handleSubmitGuess = () => {
    if (currentMarker && state.phase === 'map-view' && !isSubmitting) {
      setIsSubmitting(true)
      setGuess(currentMarker)
      showResults(currentMarker)
    }
  }

  const renderMainMenu = () => (
    <div className="game-container">
      <div className="main-menu">
        <h1>🎯 Guess the Tile</h1>
        <p>Can you recognize a corner of Ethiopia just from its roads?</p>
        <button onClick={startGame} className="start-button">
          Start Game
        </button>
        <button className="leaderboard-button">
          Leaderboard
        </button>
      </div>
    </div>
  )

  const renderTileView = () => (
    <div className="game-container">
      <div className="tile-view">
        <div className="tile-overlay">
          <h2>Memorize this tile...</h2>
          <p>You'll need to find this location on the map!</p>
          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading map...</p>
            </div>
          )}
        </div>
        <div className="tile-disabled-overlay"></div>
        <GebetaMap
          ref={mapRef}
          apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
          center={state.currentLocation || [38.7685, 9.0161]}
          zoom={15}
          style={{ width: '100%', height: '100%' }}
          onMapLoaded={handleMapLoad}
          blockInteractions={true}
        />
      </div>
    </div>
  )

  const renderCountdown = () => (
    <div className="game-container">
      <div className="countdown">
        <div className="countdown-map">
          <GebetaMap
            ref={mapRef}
            apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
            center={state.currentLocation || [38.7685, 9.0161]}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div className="countdown-overlay">
          <div className="countdown-content">
            <h1>{countdown}</h1>
            <p>Get ready to guess!</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMapView = () => (
    <div className="game-container">
      <div className="map-view">
        <div className="map-overlay">
          <h2>Place your guess!</h2>
          <p>Click on the map to place your marker, then click Submit</p>
          {currentMarker && (
            <button 
              key={`submit-${currentMarker[0]}-${currentMarker[1]}`}
              onClick={handleSubmitGuess} 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Guess'}
            </button>
          )}
        </div>
        <GebetaMap
          ref={mapRef}
          apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
          center={[38.7685, 9.0161]}
          zoom={6}
          onMapClick={handleMapClick}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  )

  const renderResults = () => {
    // Calculate center point and zoom to fit both markers
    const bounds = state.currentLocation && state.userGuess 
      ? calculateBounds(state.currentLocation, state.userGuess)
      : { center: [38.7685, 9.0161] as [number, number], zoom: 6 }

    return (
      <div className="game-container">
        <div className="map-view">
          <div className="results-score">
            <h3>Results</h3>
            {state.distance !== undefined && (
              <p>Distance: {state.distance.toFixed(1)} km</p>
            )}
            {state.roundScore !== undefined && (
              <p>Score: {state.roundScore} points</p>
            )}
            <p>Total: {state.score} points</p>
            <button onClick={() => window.location.reload()} className="play-again-button">
              Play Again
            </button>
          </div>
          <GebetaMap
            ref={mapRef}
            apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
            center={bounds.center}
            zoom={bounds.zoom}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {state.phase === 'menu' && renderMainMenu()}
      {state.phase === 'tile-view' && renderTileView()}
      {state.phase === 'countdown' && renderCountdown()}
      {state.phase === 'map-view' && renderMapView()}
      {state.phase === 'results' && renderResults()}
    </div>
  )
}

export default App
