import client from './axiosClient'

export const getShowtimes = (movieId) =>
  client.get('/api/showtimes', { params: { movieId } }).then(res => res.data)

export const getShowtime = (id) =>
  client.get(`/api/showtimes/${id}`).then(res => res.data)
