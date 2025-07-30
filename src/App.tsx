import { useRef, useEffect, useState } from 'react'
import GebetaMap from '@gebeta/tiles'
import type { GebetaMapRef } from '@gebeta/tiles'
import { useGameState } from './hooks/useGameState'
import './App.css'

function App() {
  const mapRef = useRef<GebetaMapRef>(null)
  const { state, startGame, startCountdown, showMap, setGuess, setLocation } = useGameState()
  const [countdown, setCountdown] = useState(5)
  const [currentMarker, setCurrentMarker] = useState<[number, number] | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Debug phase changes
  useEffect(() => {
    console.log('Current phase:', state.phase)
  }, [state.phase])

  // Set a target location when game starts (only once)
  useEffect(() => {
    if (state.phase === 'tile-view' && !hasStarted) {
      console.log('Starting tile view')
      setHasStarted(true)
      setLocation([38.7685, 9.0161]) // Addis Ababa for now
    }
  }, [state.phase, hasStarted, setLocation])

  // Handle countdown timer separately - wait for map to load
  useEffect(() => {
    if (state.phase === 'tile-view' && hasStarted && mapLoaded) {
      console.log('Setting up timer - map is loaded')
      const timer = setTimeout(() => {
        console.log('Starting countdown')
        startCountdown()
      }, 3000) // Show tile for 3 seconds before countdown

      return () => clearTimeout(timer)
    }
  }, [state.phase, hasStarted, mapLoaded, startCountdown])

  // Handle countdown countdown
  useEffect(() => {
    if (state.phase === 'countdown') {
      console.log('Starting countdown timer')
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          console.log('Countdown:', prev)
          if (prev <= 1) {
            console.log('Showing map')
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
    }
  }, [state.phase])

  const handleMapLoad = () => {
    console.log('Map loaded')
    setMapLoaded(true)
  }

    const handleMapClick = (lngLat: [number, number]) => {
    if (state.phase === 'map-view') {
      console.log('Placing marker at:', lngLat)
      setCurrentMarker(lngLat)
      
      // Add marker to the map using addImageMarker with custom icon
      if (mapRef.current) {
        mapRef.current.clearMarkers()
        console.log('Adding marker at coordinates:', lngLat)
        mapRef.current.addImageMarker(
          lngLat,
          '/pin.png', // Local pin icon
          [30, 30], // Size
          () => console.log('Marker clicked!'), // Click handler
          10, // Z-index
          '<b>Your Guess</b>' // Popup HTML
        )
        console.log('Marker added successfully')
      } else {
        console.log('mapRef.current is null')
      }
    }
  }

  const handleSubmitGuess = () => {
    if (currentMarker) {
      console.log('Submitting guess:', currentMarker)
      setGuess(currentMarker)
      // TODO: Calculate distance and show results
      // For now, just go back to menu
      window.location.reload() // Temporary - we'll add proper results later
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
          <p>Debug: Phase = {state.phase}, HasStarted = {hasStarted.toString()}</p>
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
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className="map-view">
        <div className="map-overlay">
          <h2>Place your guess!</h2>
          <p>Click on the map to place your marker, then click Submit</p>
          {currentMarker && (
            <button onClick={handleSubmitGuess} className="submit-button">
              Submit Guess
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

  return (
    <div className="App">
      {state.phase === 'menu' && renderMainMenu()}
      {state.phase === 'tile-view' && renderTileView()}
      {state.phase === 'countdown' && renderCountdown()}
      {state.phase === 'map-view' && renderMapView()}
    </div>
  )
}

export default App
