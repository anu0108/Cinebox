import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getMovie } from '../api/movies'
import { getShowtimes } from '../api/showtimes'
import pvrLogo       from '../assets/PVR.png'
import inoxLogo      from '../assets/INOX.png'
import cinepolisLogo from '../assets/Cinepolis.webp'

const LOGOS = { PVR: pvrLogo, INOX: inoxLogo, Cinepolis: cinepolisLogo }
const getTheatreLogo = (name) => {
  const brand = Object.keys(LOGOS).find(k => name?.startsWith(k))
  return brand ? LOGOS[brand] : null
}

const formatDuration = (mins) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

const formatTime = (isoString) =>
  new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

const MovieDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [movie, setMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Promise.all fires both requests at the same time instead of waiting
        // for one to finish before starting the other — halves the load time.
        const [movieData, showtimeData] = await Promise.all([
          getMovie(id),
          getShowtimes(id),
        ])
        setMovie(movieData)
        setShowtimes(showtimeData)
      } catch {
        setError('Failed to load movie details.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id]) // [id] means re-fetch if the user navigates to a different movie

  // Group showtimes by theatre first, then by date within each theatre
  // Structure: { theatreId: { info: {...}, dates: { "2026-04-10": [...] } } }
  const byTheatre = showtimes.reduce((acc, st) => {
    const tid = st.theatreId
    if (!acc[tid]) acc[tid] = { theatreName: st.theatreName, city: st.city, dates: {} }
    const date = st.startsAt.slice(0, 10)
    if (!acc[tid].dates[date]) acc[tid].dates[date] = []
    acc[tid].dates[date].push(st)
    return acc
  }, {})
  const theatreIds = Object.keys(byTheatre)

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-72 flex-shrink-0 aspect-[2/3] bg-gray-200 animate-pulse rounded-xl" />
          <div className="flex-1 space-y-4 pt-2">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-2/3" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3" />
            <div className="h-24 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-sm font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-gray-500 underline hover:text-gray-700"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        ← All Movies
      </Link>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Poster */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full rounded-xl shadow-md object-cover"
          />
        </aside>

        {/* Movie info + showtimes */}
        <section className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{movie.title}</h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {movie.rating}
            </span>
            <span className="text-sm text-gray-500">{formatDuration(movie.durationMins)}</span>
            {movie.genre.map((g) => (
              <span
                key={g}
                className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <p className="mt-4 text-gray-600 leading-relaxed">{movie.synopsis}</p>

          {/* Showtimes grouped by theatre → date */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Showtimes</h2>

            {theatreIds.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming showtimes for this movie.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {theatreIds.map((tid) => {
                  const { theatreName, city, dates } = byTheatre[tid]
                  const sortedDates = Object.keys(dates).sort()
                  const logo = getTheatreLogo(theatreName)
                  return (
                    <div key={tid} className="py-6 first:pt-0">
                      {/* Theatre header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100">
                          {logo
                            ? <img src={logo} alt={theatreName} className="w-full h-full object-contain" />
                            : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">{theatreName?.[0]}</div>
                          }
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{theatreName}</p>
                          <p className="text-xs text-gray-400">{city}</p>
                        </div>
                      </div>

                      {/* Dates + time pills */}
                      <div className="space-y-4">
                        {sortedDates.map((date) => (
                          <div key={date}>
                            <p className="text-xs font-medium text-gray-400 mb-2">
                              {formatDate(date)}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {dates[date].map((st) => (
                                <button
                                  key={st.id}
                                  onClick={() => navigate(`/showtimes/${st.id}/seats`, { state: { movie } })}
                                  className="border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-medium text-gray-800 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-colors min-w-[110px] text-center"
                                >
                                  {formatTime(st.startsAt)}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default MovieDetailPage
