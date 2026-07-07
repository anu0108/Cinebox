import client from './axiosClient'

export const getSeats = (showtimeId) =>
  client.get('/api/seats', { params: { showtimeId } }).then(res => res.data)

export const lockSeat = ({ seatId, showtimeId }) =>
  client.post('/api/seats/lock', { seatId, showtimeId }).then(r => r.data)

export const unlockSeat = ({ seatId }) =>
  client.post('/api/seats/unlock', { seatId }).then(r => r.data)
