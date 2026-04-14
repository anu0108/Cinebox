import client from './axiosClient'

export const loginUser     = (email, password)        => client.post('/api/auth/login',    { email, password })
export const registerUser  = (name, email, password)  => client.post('/api/auth/register', { name, email, password })
