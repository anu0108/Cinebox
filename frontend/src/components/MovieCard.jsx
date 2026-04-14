import { Link } from 'react-router-dom'

// Simplified card matching district.in style — poster + title + meta below, no chips
const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movies/${movie.id}`} className="group block">
      <div className="aspect-[2/3] w-full bg-gray-200 rounded-xl overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-2 px-0.5">
        <h2 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
          {movie.title}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {movie.rating} · {movie.genre.join(', ')}
        </p>
      </div>
    </Link>
  )
}

export default MovieCard
