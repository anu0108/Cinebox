const Razorpay = require('razorpay');
const crypto   = require('crypto');
const pool     = require('../db/pool');
const redis    = require('../db/redis');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  const { amount, showtimeId, seats } = req.body;
  if (!amount)              return res.status(400).json({ error: 'amount is required' });
  if (!showtimeId || !seats?.length) return res.status(400).json({ error: 'showtimeId and seats are required' });

  try {
    // Pre-flight availability check — keeps payment modal from opening for already-taken seats.
    // Not transactionally locked (no FOR UPDATE), so a millisecond race is still theoretically
    // possible; verifyAndBook is the true atomic guarantee.
    const { rows } = await pool.query(
      `SELECT seats FROM bookings WHERE showtime_id = $1`,
      [showtimeId]
    );
    const takenSeatIds = new Set(rows.flatMap(r => r.seats));
    const conflicting  = seats.filter(s => takenSeatIds.has(s));

    if (conflicting.length) {
      return res.status(409).json({
        error: 'Some seats are no longer available. Please go back and pick different seats.',
        seats: conflicting,
      });
    }

    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // paise
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    if (err.status === 409) throw err;
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

// Verify Razorpay signature then atomically create the booking
const verifyAndBook = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    showtimeId,
    seats,
    name,
    email,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return res.status(400).json({ error: 'Payment details are incomplete' });

  if (!showtimeId || !seats?.length || !name || !email)
    return res.status(400).json({ error: 'Booking details are incomplete' });

  // HMAC-SHA256 verification: sign "order_id|payment_id" with key_secret
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature)
    return res.status(400).json({ error: 'Payment verification failed' });

  // Signature valid — create booking inside a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: stRows } = await client.query(`
      SELECT st.movie_id       AS "movieId",
             (CURRENT_DATE + (st.days_from_now * INTERVAL '1 day') + st.show_time) AS "startsAt",
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

    if (!stRows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Showtime not found' });
    }
    const st = stRows[0];

    // Lock existing booking rows to prevent double-booking, then flatten seat arrays in JS
    const { rows: takenRows } = await client.query(
      `SELECT seats FROM bookings WHERE showtime_id = $1 FOR UPDATE`,
      [showtimeId]
    );

    const takenSeatIds = new Set(takenRows.flatMap(r => r.seats));
    const conflicting  = seats.filter(s => takenSeatIds.has(s));
    if (conflicting.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Some seats were just taken', seats: conflicting });
    }

    const id         = Date.now().toString(36);
    const emailLower = email.toLowerCase();
    const totalPrice = seats.length * st.pricePerSeat;
    const userId     = req.user.userId;

    const { rows: inserted } = await client.query(`
      INSERT INTO bookings
        (id, user_id, showtime_id, movie_id, movie_title, starts_at, hall,
         theatre_id, theatre_name, city, seats, name, email,
         total_price, booked_at, payment_id, order_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),$15,$16)
      RETURNING *
    `, [id, userId, showtimeId, st.movieId, st.movieTitle, st.startsAt,
        st.hall, st.theatreId, st.theatreName, st.city,
        seats, name, emailLower, totalPrice,
        razorpay_payment_id, razorpay_order_id]);

    await client.query('COMMIT');

    // Release Redis locks — seats are now permanently booked
    await Promise.all(seats.map(seatId => redis.del(`held:${seatId}`)));

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
      paymentId:   b.payment_id,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking after payment' });
  } finally {
    client.release();
  }
};

module.exports = { createOrder, verifyAndBook };
