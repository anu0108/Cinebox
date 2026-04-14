const express = require('express');
const router = express.Router();
const { getSeats } = require('../controllers/seatsController');

router.get('/', getSeats);

module.exports = router;
