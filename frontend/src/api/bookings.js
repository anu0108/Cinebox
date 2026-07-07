import client from './axiosClient'

export const getMyBookings = async () => {
  const res = await client.get('/api/bookings')
  return res.data
}
