import client from './axiosClient'

export const getSeats = (showtimeId) =>
  client.get('/api/seats', { params: { showtimeId } }).then(res => res.data)
