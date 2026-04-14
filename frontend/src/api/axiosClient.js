import axios from 'axios'

// In dev: baseURL is empty, Vite proxy forwards /api → localhost:5174
// In prod: VITE_API_URL points to the deployed backend (e.g. https://cinebox-api.vercel.app)
const client = axios.create({
  baseURL:         import.meta.env.VITE_API_URL || '',
  headers:         { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export default client
