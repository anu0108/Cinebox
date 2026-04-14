const pool = require('../db/pool');

const getTheatres = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, address, city, amenities FROM theatres ORDER BY id`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch theatres' });
  }
};

const getTheatreById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, address, city, amenities FROM theatres WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Theatre not found' });

    const theatre = rows[0];
    const { rows: screens } = await pool.query(
      `SELECT id, theatre_id AS "theatreId", name,
              total_rows AS "totalRows", seats_per_row AS "seatsPerRow"
       FROM screens WHERE theatre_id = $1 ORDER BY id`,
      [theatre.id]
    );
    res.json({ ...theatre, screens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch theatre' });
  }
};

// SQL equivalent of the 4-step in-memory traversal:
// Theatre → Screens → Showtimes → Movies
const getTheatreMovies = async (req, res) => {
  try {
    const { rows: check } = await pool.query(
      `SELECT id FROM theatres WHERE id = $1`, [req.params.id]
    );
    if (!check.length) return res.status(404).json({ error: 'Theatre not found' });

    const { rows } = await pool.query(`
      SELECT DISTINCT m.id, m.title,
             m.poster_url   AS "posterUrl",
             m.backdrop_url AS "backdropUrl",
             m.genre, m.rating,
             m.duration_mins AS "durationMins",
             m.synopsis
      FROM movies m
      JOIN showtimes st ON m.id = st.movie_id
      JOIN screens   sc ON st.screen_id = sc.id
      WHERE sc.theatre_id = $1
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch theatre movies' });
  }
};

module.exports = { getTheatres, getTheatreById, getTheatreMovies };
