const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByEmail } = require('../controllers/bookingsController');

router.post('/', createBooking);
router.get('/', getBookingsByEmail);

module.exports = router;
