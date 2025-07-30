import { useRef } from 'react'
import GebetaMap from '@gebeta/tiles'
import type { GebetaMapRef } from '@gebeta/tiles'
import './App.css'

function App() {
  const mapRef = useRef<GebetaMapRef>(null)

  const handleMapClick = (lngLat: [number, number]) => {
    console.log('Map clicked at:', lngLat)
  }

  return (
    <div className="App">
      <GebetaMap
        ref={mapRef}
        apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
        center={[38.7685, 9.0161]} // Addis Ababa
        zoom={10}
        onMapClick={handleMapClick}
        style={{ width: '100vw', height: '100vh' }}
      />
    </div>
  )
}

export default App
