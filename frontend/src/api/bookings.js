import client from './axiosClient'

export const createBooking = (data) =>
  client.post('/api/bookings', data).then(res => res.data)

export const getBookingsByEmail = (email) =>
  client.get('/api/bookings', { params: { email } }).then(res => res.data)
