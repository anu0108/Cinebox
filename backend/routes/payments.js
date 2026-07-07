const express = require('express');
const { createOrder, verifyAndBook } = require('../controllers/paymentsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', authMiddleware, createOrder);
router.post('/verify',       authMiddleware, verifyAndBook);

module.exports = router;
