import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <p className="text-8xl font-bold text-gray-100">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mt-2">Page not found</h1>
      <p className="text-gray-500 text-sm mt-2">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-6 bg-rose-400 hover:bg-rose-500 text-white text-sm font-semibold px-8 py-3 rounded-full transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}

export default NotFoundPage
