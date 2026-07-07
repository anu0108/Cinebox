const express        = require('express');
const router         = express.Router();
const { getMyBookings } = require('../controllers/bookingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getMyBookings);

module.exports = router;
