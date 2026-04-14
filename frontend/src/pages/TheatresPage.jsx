import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { getTheatres } from '../api/theatres'
import pvrLogo       from '../assets/PVR.png'
import inoxLogo      from '../assets/INOX.png'
import cinepolisLogo from '../assets/Cinepolis.webp'

// Map theatre name prefix → logo
const LOGOS = {
  PVR:       pvrLogo,
  INOX:      inoxLogo,
  Cinepolis: cinepolisLogo,
}

const getTheatreLogo = (name) => {
  const brand = Object.keys(LOGOS).find(k => name.startsWith(k))
  return brand ? LOGOS[brand] : null
}

const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
    <div className="h-5 bg-gray-200 animate-pulse rounded w-2/3" />
    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
    <div className="flex gap-2 mt-4">
      {[1,2,3].map(i => <div key={i} className="h-6 w-16 bg-gray-200 animate-pulse rounded-full" />)}
    </div>
  </div>
)

const TheatresPage = () => {
  const [theatres, setTheatres] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    const fetchTheatres = async () => {
      try {
        const data = await getTheatres()
        setTheatres(data)
      } catch {
        setError('Failed to load theatres.')
      } finally {
        setLoading(false)
      }
    }
    fetchTheatres()
  }, [])

  // Group theatres by city for a cleaner layout
  const byCity = theatres.reduce((acc, t) => {
    if (!acc[t.city]) acc[t.city] = []
    acc[t.city].push(t)
    return acc
  }, {})
  const cities = Object.keys(byCity).sort()

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Theatres</h1>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-20">
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-sm text-gray-500 underline">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-10">
          {cities.map(city => (
            <div key={city}>
              {/* City heading */}
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-rose-400" />
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{city}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {byCity[city].map(theatre => (
                  <Link
                    key={theatre.id}
                    to={`/theatres/${theatre.id}`}
                    className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-rose-200 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 shrink-0 overflow-hidden">
                        {getTheatreLogo(theatre.name)
                          ? <img src={getTheatreLogo(theatre.name)} alt={theatre.name} className="w-full h-full rounded-3xl" />
                          : <MapPin size={18} className="text-rose-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-rose-500 transition-colors">
                          {theatre.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{theatre.address}</p>
                      </div>
                    </div>

                    {/* Amenity chips */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {theatre.amenities.map(a => (
                        <span key={a} className="text-xs font-medium bg-rose-50 text-rose-500 border border-rose-100 px-2 py-0.5 rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TheatresPage
