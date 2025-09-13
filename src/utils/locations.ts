export interface Location {
  name: string
  coordinates: [number, number] // [longitude, latitude]
  population?: number
}

export const ETHIOPIAN_CITIES: Location[] = [
  { name: 'Addis Ababa', coordinates: [38.7685, 9.0161], population: 3352000 },
  { name: 'Dire Dawa', coordinates: [41.8667, 9.6000], population: 493000 },
  { name: 'Mekelle', coordinates: [39.4667, 13.5000], population: 323700 },
  { name: 'Gondar', coordinates: [37.4667, 12.6000], population: 324000 },
  { name: 'Adama', coordinates: [39.2667, 8.5500], population: 324000 },
  { name: 'Jimma', coordinates: [36.8167, 7.6667], population: 207573 },
  { name: 'Dessie', coordinates: [39.6333, 11.1333], population: 151094 },
  { name: 'Bahir Dar', coordinates: [37.3833, 11.6000], population: 168899 },
  { name: 'Hawassa', coordinates: [38.4667, 7.0500], population: 258808 },
  { name: 'Harar', coordinates: [42.1167, 9.3167], population: 151977 },
  { name: 'Shashamane', coordinates: [38.6000, 7.2000], population: 100454 },
  { name: 'Bishoftu', coordinates: [39.1167, 8.7500], population: 104215 },
  { name: 'Arba Minch', coordinates: [37.5500, 6.0333], population: 69522 },
  { name: 'Hosaena', coordinates: [37.8500, 7.5500], population: 69069 },
  { name: 'Dilla', coordinates: [38.3167, 6.4167], population: 47021 },
  { name: 'Nekemte', coordinates: [36.5500, 9.0833], population: 115741 },
  { name: 'Debre Birhan', coordinates: [39.5333, 9.6833], population: 65731 },
  { name: 'Asella', coordinates: [39.1333, 7.9500], population: 67626 },
  { name: 'Debre Markos', coordinates: [37.7333, 10.3333], population: 62050 },
  { name: 'Kombolcha', coordinates: [39.7333, 11.0833], population: 65000 }
]

export function getRandomLocation(selectedCities?: string[]): Location {
  const cities = selectedCities 
    ? ETHIOPIAN_CITIES.filter(city => selectedCities.includes(city.name))
    : ETHIOPIAN_CITIES
  
  if (cities.length === 0) {
    // Fallback to all cities if none selected
    const randomIndex = Math.floor(Math.random() * ETHIOPIAN_CITIES.length)
    return ETHIOPIAN_CITIES[randomIndex]
  }
  
  const randomIndex = Math.floor(Math.random() * cities.length)
  return cities[randomIndex]
}

export function getRandomCoordinates(selectedCities?: string[]): [number, number] {
  return getRandomLocation(selectedCities).coordinates
} 