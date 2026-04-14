import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import MoviesPage from './pages/MoviesPage'
import MovieDetailPage from './pages/MovieDetailPage'
import SeatSelectorPage from './pages/SeatSelectorPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import BookingHistoryPage from './pages/BookingHistoryPage'
import TheatresPage from './pages/TheatresPage'
import TheatreDetailPage from './pages/TheatreDetailPage'
import NotFoundPage from './pages/NotFoundPage'

// Separated so useAuth can be called inside AuthProvider
const AppShell = () => {
  const { modalMode } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      {modalMode && <AuthModal />}
      <main>
        <Routes>
          <Route path="/"                            element={<MoviesPage />} />
          <Route path="/movies/:id"                  element={<MovieDetailPage />} />
          <Route path="/showtimes/:showtimeId/seats" element={<SeatSelectorPage />} />
          <Route path="/checkout"                    element={<CheckoutPage />} />
          <Route path="/confirmation"                element={<ConfirmationPage />} />
          <Route path="/bookings"                    element={<BookingHistoryPage />} />
          <Route path="/theatres"                    element={<TheatresPage />} />
          <Route path="/theatres/:id"                element={<TheatreDetailPage />} />
          <Route path="*"                            element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
