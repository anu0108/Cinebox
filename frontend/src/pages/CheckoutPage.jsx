import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createBooking } from '../api/bookings'


const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })

const CheckoutPage = () => {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const { movie, showtime, selectedSeats, totalPrice } = state || {}
  const { user, openAuthModal } = useAuth()

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)

  // Guard: no booking state
  if (!movie || !showtime || !selectedSeats) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No booking in progress.</p>
        <Link to="/" className="mt-3 inline-block text-sm text-rose-400 hover:underline">
          Browse movies
        </Link>
      </div>
    )
  }

  // Guard: not logged in
  if (!user) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-gray-700 font-medium mb-2">You need to be signed in to book tickets.</p>
        <p className="text-sm text-gray-500 mb-6">Please sign in and re-select your seats.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal('login')}
            className="bg-rose-400 hover:bg-rose-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="text-sm text-rose-400 font-medium hover:underline"
          >
            Create account
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const booking = await createBooking({
        showtimeId: showtime.id,
        seats:      selectedSeats,
        name:       user.name,
        email:      user.email,
      })
      navigate('/confirmation', { state: { booking, movie } })
    } catch (err) {
      const msg = err.response?.data?.error || 'Booking failed. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const seatLabels = selectedSeats.map((id) => id.split('-').slice(1).join('-')).join(', ')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      <Link
        to={`/showtimes/${showtime.id}/seats`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        ← Back to seats
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Confirm Booking</h1>

      <div className="flex flex-col gap-6">

        {/* Order summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="flex gap-4">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-16 h-24 object-cover rounded-lg shrink-0"
            />
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">{movie.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(showtime.startsAt)} · {formatTime(showtime.startsAt)}
              </p>
              <p className="text-sm text-gray-500">{showtime.hall}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Seats</span>
              <span className="text-gray-900 font-medium">{seatLabels}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Price per seat</span>
              <span className="text-gray-900">₹{showtime.pricePerSeat}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Seat count</span>
              <span className="text-gray-900">{selectedSeats.length}</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t border-gray-100 pt-2 mt-2">
              <span className="text-gray-900">Total</span>
              <span className="text-rose-400">₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Contact details — read-only, pulled from auth */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Contact Details</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
              <p className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                {user.name}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <p className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-rose-400 hover:bg-rose-500 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition-colors"
          >
            {submitting ? 'Confirming...' : `Pay ₹${totalPrice}`}
          </button>
        </form>

      </div>
    </div>
  )
}

export default CheckoutPage
