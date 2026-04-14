import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { getShowtime } from '../api/showtimes'
import { getSeats } from '../api/seats'
import screenImg from '../assets/screen-img-light.b7b18ffd.png'

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

const SeatSelectorPage = () => {
  const { showtimeId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  const movie = state?.movie || null

  const [showtime, setShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [showtimeData, seatsData] = await Promise.all([
          getShowtime(showtimeId),
          getSeats(showtimeId),
        ])
        setShowtime(showtimeData)
        setSeats(seatsData)
      } catch {
        setError('Failed to load seat information.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [showtimeId])

  const toggleSeat = (seat) => {
    if (seat.status === 'taken') return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(seat.id) ? next.delete(seat.id) : next.add(seat.id)
      return next
    })
  }

  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = []
    acc[seat.row].push(seat)
    return acc
  }, {})
  const rowLabels = Object.keys(rows).sort().reverse()

  const selectedCount = selectedIds.size
  const totalPrice = showtime ? selectedCount * showtime.pricePerSeat : 0

  const handleContinue = () => {
    navigate('/checkout', {
      state: { movie, showtime, selectedSeats: [...selectedIds], totalPrice },
    })
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3" />
        <div className="h-64 bg-gray-200 animate-pulse rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-sm font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 text-sm text-gray-500 underline">
          Try again
        </button>
      </div>
    )
  }

  const renderSeat = (seat) => {
    const isTaken = seat.status === 'taken'
    const isSelected = selectedIds.has(seat.id)
    return (
      <button
        key={seat.id}
        onClick={() => toggleSeat(seat)}
        disabled={isTaken}
        title={isTaken ? 'Taken' : `${seat.row}${seat.number}`}
        className={`w-8 h-7 rounded-t-lg text-xs font-medium transition-all duration-150 border
          ${isTaken
            ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed'
            : isSelected
              ? 'bg-rose-400 border-rose-400 text-white shadow-sm scale-105'
              : 'bg-white border-gray-300 text-gray-500 hover:border-rose-300 hover:bg-rose-50 cursor-pointer'
          }`}
      >
        {seat.number}
      </button>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 pb-36">

      {/* Back link */}
      <Link
        to={movie ? `/movies/${movie.id}` : '/'}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        ← Back
      </Link>

      {/* Header */}
      <div className="mb-8">
        {movie && <h1 className="text-2xl font-bold text-gray-900">{movie.title}</h1>}
        {showtime && (
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(showtime.startsAt)} · {formatTime(showtime.startsAt)} · {showtime.hall}
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {[
          { color: 'bg-white border border-gray-300', label: 'Available' },
          { color: 'bg-rose-400 border-rose-400', label: 'Selected' },
          { color: 'bg-gray-200 border-gray-200', label: 'Taken' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-5 h-4 rounded-t-md border ${color}`} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Seat grid — centered, each row: label + left block + aisle + right block */}
      <div className="flex flex-col items-center space-y-2 mb-10">
        {rowLabels.map((row) => {
          const rowSeats = rows[row]
          const mid = Math.ceil(rowSeats.length / 2)
          const left = rowSeats.slice(0, mid)
          const right = rowSeats.slice(mid)
          return (
            <div key={row} className="flex items-center gap-2">
              <span className="w-5 text-xs font-medium text-gray-400 text-center shrink-0">
                {row}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1.5">{left.map(renderSeat)}</div>
                <div className="w-6 shrink-0" />
                <div className="flex gap-1.5">{right.map(renderSeat)}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Screen — at the bottom, as seen from the audience */}
      <div className="flex flex-col items-center">
        <img
          src={screenImg}
          alt="Screen"
          className="w-3/4 opacity-80"
          style={{ filter: 'hue-rotate(70deg) saturate(1.2)' }}
        />
        <p className="text-xs text-gray-400 mt-2 tracking-widest uppercase">Screen</p>
      </div>

      {/* Sticky bottom summary bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedCount} seat{selectedCount > 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                ₹{showtime.pricePerSeat} × {selectedCount}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xl font-bold text-gray-900">₹{totalPrice.toFixed(0)}</p>
              <button
                onClick={handleContinue}
                className="bg-rose-400 hover:bg-rose-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SeatSelectorPage
