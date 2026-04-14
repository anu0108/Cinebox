const pool = require('../db/pool');

const createBooking = async (req, res) => {
  const { showtimeId, seats, name, email } = req.body;

  if (!showtimeId || !seats?.length || !name || !email)
    return res.status(400).json({ error: 'showtimeId, seats, name, and email are required' });

  try {
    // Single JOIN resolves everything needed for the booking snapshot
    const { rows: stRows } = await pool.query(`
      SELECT st.movie_id       AS "movieId",
             st.starts_at      AS "startsAt",
             st.price_per_seat AS "pricePerSeat",
             sc.name           AS hall,
             th.id             AS "theatreId",
             th.name           AS "theatreName",
             th.city,
             m.title           AS "movieTitle"
      FROM showtimes st
      JOIN screens  sc ON st.screen_id  = sc.id
      JOIN theatres th ON sc.theatre_id = th.id
      JOIN movies   m  ON st.movie_id   = m.id
      WHERE st.id = $1
    `, [showtimeId]);

    if (!stRows.length) return res.status(404).json({ error: 'Showtime not found' });
    const st = stRows[0];

    // Seat conflict check — in PostgreSQL this becomes SELECT FOR UPDATE inside a transaction
    const { rows: takenRows } = await pool.query(
      `SELECT unnest(seats) AS seat_id FROM bookings WHERE showtime_id = $1`,
      [showtimeId]
    );
    const takenSeatIds = new Set(takenRows.map(r => r.seat_id));
    const conflicting = seats.filter(s => takenSeatIds.has(s));
    if (conflicting.length > 0)
      return res.status(409).json({ error: 'Some seats are already taken', seats: conflicting });

    const id         = Date.now().toString(36);
    const emailLower = email.toLowerCase();
    const totalPrice = seats.length * st.pricePerSeat;

    const { rows: inserted } = await pool.query(`
      INSERT INTO bookings
        (id, showtime_id, movie_id, movie_title, starts_at, hall,
         theatre_id, theatre_name, city, seats, name, email, total_price, booked_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, NOW())
      RETURNING *
    `, [id, showtimeId, st.movieId, st.movieTitle, st.startsAt,
        st.hall, st.theatreId, st.theatreName, st.city,
        seats, name, emailLower, totalPrice]);

    const b = inserted[0];
    res.status(201).json({
      id:          b.id,
      showtimeId:  b.showtime_id,
      movieId:     b.movie_id,
      movieTitle:  b.movie_title,
      startsAt:    b.starts_at,
      hall:        b.hall,
      theatreId:   b.theatre_id,
      theatreName: b.theatre_name,
      city:        b.city,
      seats:       b.seats,
      name:        b.name,
      email:       b.email,
      totalPrice:  b.total_price,
      bookedAt:    b.booked_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

const getBookingsByEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'email query param is required' });

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
      WHERE email = $1
      ORDER BY booked_at DESC
    `, [email.toLowerCase()]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

module.exports = { createBooking, getBookingsByEmail };
