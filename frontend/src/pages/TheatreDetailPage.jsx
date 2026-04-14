import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Monitor } from 'lucide-react'
import { getTheatre, getTheatreMovies } from '../api/theatres'
import MovieCard from '../components/MovieCard'

const TheatreDetailPage = () => {
  const { id } = useParams()
  const [theatre, setTheatre]   = useState(null)
  const [movies, setMovies]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [theatreData, moviesData] = await Promise.all([
          getTheatre(id),
          getTheatreMovies(id),
        ])
        setTheatre(theatreData)
        setMovies(moviesData)
      } catch {
        setError('Failed to load theatre details.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-10 space-y-4">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3" />
        <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4" />
        <div className="h-48 bg-gray-200 animate-pulse rounded-2xl mt-6" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 text-sm text-gray-500 underline">Try again</button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">

      <Link to="/theatres" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        ← All Theatres
      </Link>

      {/* Theatre header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-10">
        <h1 className="text-2xl font-bold text-gray-900">{theatre.name}</h1>
        <div className="flex items-center gap-1.5 mt-1.5">
          <MapPin size={14} className="text-rose-400" />
          <p className="text-sm text-gray-500">{theatre.address}, {theatre.city}</p>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mt-4">
          {theatre.amenities.map(a => (
            <span key={a} className="text-xs font-medium bg-rose-50 text-rose-500 border border-rose-100 px-3 py-1 rounded-full">
              {a}
            </span>
          ))}
        </div>

        {/* Screens */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Monitor size={15} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{theatre.screens?.length} Screens</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {theatre.screens?.map(sc => (
              <span key={sc.id} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                {sc.name} · {sc.totalRows * sc.seatsPerRow} seats
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Movies playing here */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">Now Playing</h2>

      {movies.length === 0 ? (
        <p className="text-gray-400 text-sm">No movies currently playing at this theatre.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  )
}

export default TheatreDetailPage
