import client from './axiosClient'

export const getTheatres      = ()   => client.get('/api/theatres').then(r => r.data)
export const getTheatre       = (id) => client.get(`/api/theatres/${id}`).then(r => r.data)
export const getTheatreMovies = (id) => client.get(`/api/theatres/${id}/movies`).then(r => r.data)
