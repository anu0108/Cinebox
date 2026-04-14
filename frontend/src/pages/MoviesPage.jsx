import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { getMovies } from '../api/movies'
import MovieCard from '../components/MovieCard'

const SkeletonCard = () => (
  <div className="bg-white rounded-xl overflow-hidden">
    <div className="aspect-[2/3] w-full bg-gray-200 animate-pulse rounded-xl" />
    <div className="mt-2 space-y-1.5">
      <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
      <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
    </div>
  </div>
)

// Hero carousel — cycles through all movies
const Hero = ({ movies, navigate }) => {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((i) => (i === 0 ? movies.length - 1 : i - 1))
  const next = () => setCurrent((i) => (i === movies.length - 1 ? 0 : i + 1))

  // Auto-advance every 5 seconds, resets if user manually navigates
  useEffect(() => {
    const timer = setTimeout(next, 5000)
    return () => clearTimeout(timer) // cleanup prevents stale timers on unmount
  }, [current, movies.length])

  const movie = movies[current]
  if (!movie) return null

  return (
    <div className="relative w-full bg-white overflow-hidden">
      {/* Subtle blurred backdrop — barely visible, just adds depth */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt=""
          className="w-full h-full object-cover blur-2xl scale-110 opacity-20"
        />
      </div>

      {/* Arrows — absolutely positioned at viewport edges */}
      <button
        onClick={prev}
        className="absolute left-20 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft size={14} className="text-gray-700" />
      </button>
      <button
        onClick={next}
        className="absolute right-20 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
      >
        <ChevronRight size={14} className="text-gray-700" />
      </button>

      {/* Content — same max-w and px as section below */}
      <div className="max-w-7xl mx-auto px-8 py-14 flex items-center justify-between gap-10">
        <div className="flex-1 max-w-lg">
          <p className="text-sm font-medium text-gray-500 mb-2">
            {movie.rating} &nbsp;|&nbsp; {movie.genre.join(', ')}
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">{movie.title}</h1>
          <p className="mt-4 text-gray-500 text-sm leading-relaxed line-clamp-3">
            {movie.synopsis}
          </p>
          <button
            onClick={() => navigate(`/movies/${movie.id}`)}
            className="mt-8 bg-gray-900 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Book now
          </button>
        </div>

        <div className="shrink-0 w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-xl">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Dot indicators */}
      <div className="relative flex justify-center gap-2 pb-6">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-6 h-2 bg-gray-900' : 'w-2 h-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

const MoviesPage = () => {
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies()
        setMovies(data)
      } catch {
        setError('Failed to load movies. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }, [])

  const genres = useMemo(() => {
    const all = movies.flatMap((m) => m.genre)
    return ['All', ...new Set(all)]
  }, [movies])

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase())
      const matchesGenre = activeGenre === 'All' || m.genre.includes(activeGenre)
      return matchesSearch && matchesGenre
    })
  }, [movies, search, activeGenre])

  return (
    <div>
      {/* Hero carousel */}
      {!loading && movies.length > 0 && (
        <Hero movies={movies} navigate={navigate} />
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* Section header + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-bold text-gray-900">Now Showing</h2>
          <div className="relative max-w-xs w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </div>

        {/* Genre filter chips */}
        {!loading && (
          <div className="flex gap-2 flex-wrap mb-8">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGenre(g)}
                className={`text-xs font-medium px-4 py-1.5 rounded-full border transition-colors ${
                  activeGenre === g
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-sm text-gray-500 underline">
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">No movies match your search.</p>
            <button
              onClick={() => { setSearch(''); setActiveGenre('All') }}
              className="mt-3 text-sm text-rose-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Movie grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MoviesPage
