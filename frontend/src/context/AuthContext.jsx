import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/axiosClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,      setUser]      = useState(null)
  const [ready,     setReady]     = useState(false)
  // modalMode: null | 'login' | 'signup'
  const [modalMode, setModalMode] = useState(null)

  useEffect(() => {
    client.get('/api/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true))
  }, [])

  const login = async (email, password) => {
    const { data } = await client.post('/api/auth/login', { email, password })
    setUser(data.user)
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await client.post('/api/auth/register', { name, email, password })
    setUser(data.user)
    return data
  }

  const logout = async () => {
    await client.post('/api/auth/logout')
    setUser(null)
  }

  const openAuthModal  = (mode = 'login') => setModalMode(mode)
  const closeAuthModal = () => setModalMode(null)

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, modalMode, openAuthModal, closeAuthModal }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
