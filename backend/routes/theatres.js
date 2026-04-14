const express = require('express');
const router  = express.Router();
const { getTheatres, getTheatreById, getTheatreMovies } = require('../controllers/theatresController');

router.get('/',           getTheatres);
router.get('/:id',        getTheatreById);
router.get('/:id/movies', getTheatreMovies);

module.exports = router;
