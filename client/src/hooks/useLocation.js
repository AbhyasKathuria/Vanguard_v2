import { useState, useEffect } from 'react'

export function useLocation() {
  const [location, setLocation] = useState(null)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const detectLocation = () => {
    setLoading(true)
    setError(null)
    
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
            { headers: { 'User-Agent': 'VANGUARD-App/1.0' } }
          )
          const data = await response.json()
          const addr = data.address
          setAddress({
            full: data.display_name,
            village: addr.village || addr.suburb || addr.town || addr.city || '',
            ward: addr.quarter || addr.neighbourhood || '',
            district: addr.county || addr.city_district || addr.city || '',
            state: addr.state || '',
            postcode: addr.postcode || ''
          })
        } catch (err) {
          setAddress({ full: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` })
        }
        setLoading(false)
      },
      (err) => {
        setError('Location access denied. Please enable location or enter manually.')
        setLoading(false)
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  }

  return { location, address, loading, error, detectLocation }
}
