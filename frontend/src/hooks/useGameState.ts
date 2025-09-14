import { useState } from 'react'
import type { GameState } from '../types/game'
import { calculateDistance, calculateScore } from '../utils/distance'

export function useGameState() {
  const [state, setState] = useState<GameState>({
    phase: 'menu',
    currentLocation: null,
    userGuess: null,
    score: 0,
    round: 0,
    distance: null,
    points: null,
    roundScore: null,
    isLoading: false,
    isSubmitting: false
  })

  const startGame = () => setState(prev => ({ 
    ...prev, 
    phase: 'preparing', 
    score: 0,
    currentLocation: null,
    userGuess: null,
    distance: null,
    points: null,
    roundScore: null,
    isLoading: false,
    isSubmitting: false
  }))
  const startTileView = () => setState(prev => ({ ...prev, phase: 'tile-view' }))
  const startCountdown = () => setState(prev => ({ ...prev, phase: 'countdown' }))
  const showMap = () => setState(prev => ({ ...prev, phase: 'map-view' }))
  const setGuess = (coordinates: [number, number]) => setState(prev => ({ ...prev, userGuess: coordinates }))
  const setLocation = (coordinates: [number, number]) => setState(prev => ({ ...prev, currentLocation: coordinates }))
  
  const showResults = (currentGuess?: [number, number]) => {
    const guess = currentGuess || state.userGuess
    if (state.currentLocation && guess) {
      const [actualLng, actualLat] = state.currentLocation
      const [guessLng, guessLat] = guess
      
      const distance = calculateDistance(actualLat, actualLng, guessLat, guessLng)
      const roundScore = calculateScore(distance)
      
      setState(prev => ({
        ...prev,
        phase: 'results',
        userGuess: guess,
        distance,
        roundScore,
        score: prev.score + roundScore
      }))
    }
  }

  const resetGame = () => setState({
    phase: 'menu',
    currentLocation: null,
    userGuess: null,
    score: 0,
    round: 0,
    distance: null,
    points: null,
    roundScore: null,
    isLoading: false,
    isSubmitting: false
  })
  
  return { 
    state, 
    startGame, 
    startTileView,
    startCountdown, 
    showMap, 
    setGuess, 
    setLocation,
    showResults,
    resetGame
  }
} 