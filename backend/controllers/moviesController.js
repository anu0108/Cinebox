const pool = require('../db/pool');

const getMovies = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, title,
             poster_url    AS "posterUrl",
             backdrop_url  AS "backdropUrl",
             genre, rating,
             duration_mins AS "durationMins",
             synopsis
      FROM movies
      ORDER BY id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

const getMovieById = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, title,
             poster_url    AS "posterUrl",
             backdrop_url  AS "backdropUrl",
             genre, rating,
             duration_mins AS "durationMins",
             synopsis
      FROM movies
      WHERE id = $1
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ error: 'Movie not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
};

module.exports = { getMovies, getMovieById };
