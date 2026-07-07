import axiosClient from './axiosClient';

export const createOrder = ({ amount, showtimeId, seats }) =>
  axiosClient.post('/api/payments/create-order', { amount, showtimeId, seats }).then(r => r.data);

export const verifyAndBook = (payload) =>
  axiosClient.post('/api/payments/verify', payload).then(r => r.data);
