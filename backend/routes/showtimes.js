const express = require('express');
const router = express.Router();
const { getShowtimes, getShowtimeById } = require('../controllers/showtimesController');

router.get('/', getShowtimes);
router.get('/:id', getShowtimeById);

module.exports = router;
