import { useLocation, Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

const ConfirmationPage = () => {
  const { state } = useLocation()
  const { booking, movie } = state || {}

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No booking found.</p>
        <Link to="/" className="mt-3 inline-block text-sm text-rose-400 hover:underline">
          Browse movies
        </Link>
      </div>
    )
  }

  const seatLabels = booking.seats.map((id) => id.split('-').slice(1).join('-')).join(', ')

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">

      {/* Success icon */}
      <div className="flex justify-center mb-4">
        <CheckCircle size={56} className="text-rose-400" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
      <p className="text-gray-500 text-sm mt-2">
        Your tickets have been booked successfully.
      </p>

      {/* Booking card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-8 text-left space-y-4">

        {/* Movie info */}
        <div className="flex gap-4">
          {movie && (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-14 h-20 object-cover rounded-lg shrink-0"
            />
          )}
          <div>
            <h2 className="font-semibold text-gray-900">{booking.movieTitle}</h2>
            <p className="text-sm text-gray-500 mt-1">{formatDate(booking.startsAt)}</p>
            <p className="text-sm text-gray-500">{formatTime(booking.startsAt)} · {booking.hall}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Booking ID</span>
            <span className="font-mono text-gray-900 font-medium">#{booking.id.toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Name</span>
            <span className="text-gray-900">{booking.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Seats</span>
            <span className="text-gray-900 font-medium">{seatLabels}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-gray-100 pt-2">
            <span className="text-gray-900">Total Paid</span>
            <span className="text-rose-400">₹{booking.totalPrice}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Link
          to="/bookings"
          className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-full hover:bg-gray-50 transition-colors"
        >
          My Orders
        </Link>
        <Link
          to="/"
          className="flex-1 bg-rose-400 hover:bg-rose-500 text-white text-sm font-medium py-2.5 rounded-full transition-colors"
        >
          Browse More
        </Link>
      </div>
    </div>
  )
}

export default ConfirmationPage
