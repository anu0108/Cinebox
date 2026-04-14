import client from './axiosClient'

export const getMovies = () => client.get('/api/movies').then(res => res.data)
export const getMovie = (id) => client.get(`/api/movies/${id}`).then(res => res.data)
