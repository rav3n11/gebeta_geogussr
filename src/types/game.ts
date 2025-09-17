export interface GameState {
  phase: 'menu' | 'preparing' | 'tile-view' | 'image-view' | 'countdown' | 'map-view' | 'results'
  score: number
  round: number
  currentLocation: [number, number] | null
  userGuess: [number, number] | null
  distance: number | null
  points: number | null
  roundScore: number | null
  isLoading: boolean
  isSubmitting: boolean
  isImageMode?: boolean
  imageUrl?: string | null
}

export interface GameSettings {
  selectedCities: string[]
  tileViewDuration: number // in seconds
}

export interface City {
  name: string
  coordinates: [number, number]
  region: string
}

export const AVAILABLE_CITIES: City[] = [
  { name: 'Addis Ababa', coordinates: [38.7685, 9.0161], region: 'Central' },
  { name: 'Dire Dawa', coordinates: [41.8702, 9.6889], region: 'Eastern' },
  { name: 'Gondar', coordinates: [37.4572, 12.6081], region: 'Northern' },
  { name: 'Bahir Dar', coordinates: [37.3905, 11.6004], region: 'Northern' },
  { name: 'Mekelle', coordinates: [39.4692, 13.4966], region: 'Northern' },
  { name: 'Hawassa', coordinates: [38.5018, 7.0621], region: 'Southern' },
  { name: 'Jimma', coordinates: [36.8200, 7.6667], region: 'Southwestern' },
  { name: 'Harar', coordinates: [42.1186, 9.3144], region: 'Eastern' },
  { name: 'Jijiga', coordinates: [42.8000, 9.3500], region: 'Eastern' },
  { name: 'Arba Minch', coordinates: [37.5500, 6.0333], region: 'Southern' },
  { name: 'Shashamane', coordinates: [38.6000, 7.2000], region: 'Southern' },
  { name: 'Dessie', coordinates: [39.6833, 11.1333], region: 'Northern' },
  { name: 'Sodo', coordinates: [37.7667, 6.8500], region: 'Southern' },
  { name: 'Debre Markos', coordinates: [37.7167, 10.3333], region: 'Central' },
  { name: 'Adama', coordinates: [39.2667, 8.5500], region: 'Central' }
]

export const DEFAULT_SETTINGS: GameSettings = {
  selectedCities: AVAILABLE_CITIES.map(city => city.name),
  tileViewDuration: 10
}