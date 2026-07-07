const express        = require('express');
const router         = express.Router();
const { getSeats, lockSeat, unlockSeat } = require('../controllers/seatsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/',       getSeats);
router.post('/lock',  authMiddleware, lockSeat);
router.post('/unlock',authMiddleware, unlockSeat);

module.exports = router;
