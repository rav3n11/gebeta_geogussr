export interface Location {
  id: string
  name: string
  coordinates: [number, number] // [lng, lat]
  region: string
}

export interface GameState {
  phase: 'menu' | 'tile-view' | 'countdown' | 'map-view' | 'results'
  currentLocation: [number, number] | null
  userGuess: [number, number] | null
  score: number
  round: number
  distance?: number
  roundScore?: number
}

export interface RoundResult {
  round: number
  actualLocation: Location
  userGuess: [number, number]
  distance: number
  score: number
}

export interface GameSettings {
  totalRounds: number
  maxScorePerRound: number
  timeLimit?: number // in seconds
} 