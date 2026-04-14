const pool = require('../db/pool');

const ROWS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

const getSeats = async (req, res) => {
  const { showtimeId } = req.query;
  if (!showtimeId) return res.status(400).json({ error: 'showtimeId query param is required' });

  try {
    // JOIN showtime → screen to get grid dimensions
    const { rows: stRows } = await pool.query(`
      SELECT sc.total_rows AS "totalRows", sc.seats_per_row AS "seatsPerRow"
      FROM showtimes st
      JOIN screens sc ON st.screen_id = sc.id
      WHERE st.id = $1
    `, [showtimeId]);

    if (!stRows.length) return res.status(404).json({ error: 'Showtime not found' });
    const { totalRows, seatsPerRow } = stRows[0];

    // Get all taken seat IDs for this showtime via unnest
    const { rows: takenRows } = await pool.query(
      `SELECT unnest(seats) AS seat_id FROM bookings WHERE showtime_id = $1`,
      [showtimeId]
    );
    const takenSeatIds = new Set(takenRows.map(r => r.seat_id));

    const seats = [];
    for (let r = 0; r < totalRows; r++) {
      const row = ROWS[r];
      for (let n = 1; n <= seatsPerRow; n++) {
        const id = `${showtimeId}-${row}${n}`;
        seats.push({ id, showtimeId, row, number: n,
          status: takenSeatIds.has(id) ? 'taken' : 'available' });
      }
    }

    res.json(seats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
};

module.exports = { getSeats };
