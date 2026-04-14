import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Building2, Ticket, Bell, MessageSquare, ChevronDown, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/',         label: 'Home',     icon: Home },
  { to: '/theatres', label: 'Theatres', icon: Building2 },
  { to: '/bookings', label: 'Orders',   icon: Ticket },
]

const Navbar = () => {
  const { pathname }        = useLocation()
  const navigate            = useNavigate()
  const { user, logout, openAuthModal } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef         = useRef(null)

  const isActive = (to) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <nav className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow">

      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-black-500 tracking-tight shrink-0">
        🎬 Cinebox
      </Link>

      {/* Center pill nav */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-full px-1.5 py-1.5">
        {navLinks.map(({ to, label, icon: Icon }) => {
          const active = isActive(to)
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-rose-400 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors">
          <MessageSquare size={16} />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors">
          <Bell size={16} />
        </button>

        {user ? (
          // Logged-in: avatar with first letter + dropdown
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-1 group"
            >
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-semibold text-sm group-hover:bg-rose-200 transition-colors">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          // Not logged in: Login button
          <button
            onClick={() => openAuthModal('login')}
            className="ml-1 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-400 text-white text-sm font-medium hover:bg-rose-500 transition-colors"
          >
            <User size={14} />
            Login
          </button>
        )}
      </div>

    </nav>
  )
}

export default Navbar
