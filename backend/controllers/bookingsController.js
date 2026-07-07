const pool = require('../db/pool');

const getMyBookings = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { rows } = await pool.query(`
      SELECT id,
             showtime_id  AS "showtimeId",
             movie_id     AS "movieId",
             movie_title  AS "movieTitle",
             starts_at    AS "startsAt",
             hall,
             theatre_id   AS "theatreId",
             theatre_name AS "theatreName",
             city, seats, name, email,
             total_price  AS "totalPrice",
             booked_at    AS "bookedAt"
      FROM bookings
      WHERE user_id = $1
      ORDER BY booked_at DESC
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

module.exports = { getMyBookings };
