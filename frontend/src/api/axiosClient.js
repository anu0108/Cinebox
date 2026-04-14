import axios from 'axios'

// All API calls use this instance.
// baseURL is empty because Vite's proxy forwards /api → backend.
// withCredentials: true tells the browser to send the HTTP-only auth cookie on every request.
const client = axios.create({
  baseURL:         '',
  headers:         { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export default client
