const pool = require('../db/pool');

// enrichShowtime() is now a SQL JOIN — same shape returned, zero frontend changes needed.
const SHOWTIME_JOIN = `
  SELECT st.id,
         st.movie_id       AS "movieId",
         st.screen_id      AS "screenId",
         st.starts_at      AS "startsAt",
         st.price_per_seat AS "pricePerSeat",
         sc.name           AS hall,
         sc.total_rows     AS "totalRows",
         sc.seats_per_row  AS "seatsPerRow",
         th.id             AS "theatreId",
         th.name           AS "theatreName",
         th.city
  FROM showtimes st
  JOIN screens   sc ON st.screen_id   = sc.id
  JOIN theatres  th ON sc.theatre_id  = th.id
`;

const getShowtimes = async (req, res) => {
  const { movieId } = req.query;
  if (!movieId) return res.status(400).json({ error: 'movieId query param is required' });

  try {
    const { rows } = await pool.query(
      `${SHOWTIME_JOIN} WHERE st.movie_id = $1 ORDER BY st.starts_at`,
      [movieId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch showtimes' });
  }
};

const getShowtimeById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `${SHOWTIME_JOIN} WHERE st.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Showtime not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch showtime' });
  }
};

module.exports = { getShowtimes, getShowtimeById };
