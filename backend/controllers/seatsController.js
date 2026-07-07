const pool  = require('../db/pool');
const redis = require('../db/redis');

const ROWS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const LOCK_TTL = 600; // 10 minutes in seconds

const getSeats = async (req, res) => {
  const { showtimeId } = req.query;
  if (!showtimeId) return res.status(400).json({ error: 'showtimeId query param is required' });

  try {
    const { rows: stRows } = await pool.query(`
      SELECT sc.total_rows AS "totalRows", sc.seats_per_row AS "seatsPerRow"
      FROM showtimes st
      JOIN screens sc ON st.screen_id = sc.id
      WHERE st.id = $1
    `, [showtimeId]);

    if (!stRows.length) return res.status(404).json({ error: 'Showtime not found' });
    const { totalRows, seatsPerRow } = stRows[0];

    // DB taken + Redis held fetched in parallel — no dependency between the two
    const [{ rows: takenRows }, heldKeys] = await Promise.all([
      pool.query(`SELECT unnest(seats) AS seat_id FROM bookings WHERE showtime_id = $1`, [showtimeId]),
      redis.keys(`held:${showtimeId}-*`),
    ]);
    const takenSeatIds = new Set(takenRows.map(r => r.seat_id));
    const heldSeatIds  = new Set(heldKeys.map(k => k.slice('held:'.length)));

    const seats = [];
    for (let r = 0; r < totalRows; r++) {
      if (r >= ROWS.length) break; // guard: screen has more rows than ROWS alphabet supports
      const row = ROWS[r];
      for (let n = 1; n <= seatsPerRow; n++) {
        const id     = `${showtimeId}-${row}${n}`;
        const status = takenSeatIds.has(id) ? 'taken'
                     : heldSeatIds.has(id)  ? 'held'
                     :                        'available';
        seats.push({ id, showtimeId, row, number: n, status });
      }
    }

    res.json(seats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
};

// Acquire a Redis lock for a seat (requires auth)
const lockSeat = async (req, res) => {
  const { seatId, showtimeId } = req.body;
  if (!seatId || !showtimeId) return res.status(400).json({ error: 'seatId and showtimeId are required' });

  const userId = req.user.userId;

  try {
    // Reject if already permanently booked
    const { rows } = await pool.query(
      `SELECT 1 FROM bookings WHERE showtime_id = $1 AND $2 = ANY(seats)`,
      [showtimeId, seatId]
    );
    if (rows.length) return res.status(409).json({ error: 'Seat is already booked' });

    // SET NX EX — atomic: only sets if key does not exist
    const acquired = await redis.set(`held:${seatId}`, userId, { ex: LOCK_TTL, nx: true });

    if (acquired === null) {
      // Key already exists — check if current user already holds it
      const holder = await redis.get(`held:${seatId}`);
      if (String(holder) === String(userId)) {
        // Refresh TTL so it doesn't expire mid-session
        await redis.expire(`held:${seatId}`, LOCK_TTL);
        return res.json({ locked: true });
      }
      return res.status(409).json({ error: 'Seat is held by another user' });
    }

    res.json({ locked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to lock seat' });
  }
};

// Release a Redis lock (requires auth — only the holder can release)
const unlockSeat = async (req, res) => {
  const { seatId } = req.body;
  if (!seatId) return res.status(400).json({ error: 'seatId is required' });

  const userId = req.user.userId;

  try {
    const holder = await redis.get(`held:${seatId}`);
    // Only the user who locked it can unlock it
    if (holder !== null && String(holder) !== String(userId)) {
      return res.status(403).json({ error: 'You do not hold this seat' });
    }
    await redis.del(`held:${seatId}`);
    res.json({ released: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unlock seat' });
  }
};

module.exports = { getSeats, lockSeat, unlockSeat };
