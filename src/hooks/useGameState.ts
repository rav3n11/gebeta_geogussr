import { useState } from 'react'
import type { GameState } from '../types/game'

export function useGameState() {
  const [state, setState] = useState<GameState>({
    phase: 'menu',
    currentLocation: null,
    userGuess: null,
    score: 0,
    round: 0
  })

  const startGame = () => setState(prev => ({ ...prev, phase: 'tile-view' }))
  const startCountdown = () => setState(prev => ({ ...prev, phase: 'countdown' }))
  const showMap = () => setState(prev => ({ ...prev, phase: 'map-view' }))
  const setGuess = (coordinates: [number, number]) => setState(prev => ({ ...prev, userGuess: coordinates }))
  const setLocation = (coordinates: [number, number]) => setState(prev => ({ ...prev, currentLocation: coordinates }))
  
  return { 
    state, 
    startGame, 
    startCountdown, 
    showMap, 
    setGuess, 
    setLocation 
  }
} 