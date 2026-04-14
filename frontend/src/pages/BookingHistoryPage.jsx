import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Ticket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getBookingsByEmail } from '../api/bookings'


const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })

const BookingHistoryPage = () => {
  const { user, openAuthModal } = useAuth()

  const [bookings,  setBookings]  = useState([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [fetched,   setFetched]   = useState(false)

  // Auto-fetch when user is logged in
  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)
    getBookingsByEmail(user.email)
      .then((data) => { setBookings(data); setFetched(true) })
      .catch(() => setError('Failed to fetch bookings. Please try again.'))
      .finally(() => setLoading(false))
  }, [user])

  // Not logged in
  if (!user) {
    return (
      <div className="text-center py-20 px-4">
        <Ticket size={40} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-700 font-medium mb-2">Sign in to view your orders</p>
        <p className="text-sm text-gray-500 mb-6">Your booking history will appear here.</p>
        <button
          onClick={() => openAuthModal('login')}
          className="bg-rose-400 hover:bg-rose-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          Sign in
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Orders</h1>
      <p className="text-sm text-gray-500 mb-8">{user.email}</p>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {fetched && !loading && bookings.length === 0 && (
        <div className="text-center py-16">
          <Ticket size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No bookings yet.</p>
          <Link to="/" className="mt-3 inline-block text-sm text-rose-400 hover:underline">
            Browse movies
          </Link>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const seatLabels = booking.seats.map((id) => id.split('-').slice(1).join('-')).join(', ')
            return (
              <div key={booking.id} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">{booking.movieTitle}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatDate(booking.startsAt)} · {formatTime(booking.startsAt)} · {booking.hall}
                    </p>
                    <p className="text-sm text-gray-400">{booking.theatreName}</p>
                  </div>
                  <span className="text-sm font-bold text-rose-400">₹{booking.totalPrice}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Seats: <span className="text-gray-700 font-medium">{seatLabels}</span>
                  </span>
                  <span className="text-xs font-mono text-gray-400">#{booking.id.toUpperCase()}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default BookingHistoryPage
