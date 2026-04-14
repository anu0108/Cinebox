require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');

const moviesRouter    = require('./routes/movies');
const showtimesRouter = require('./routes/showtimes');
const seatsRouter     = require('./routes/seats');
const bookingsRouter  = require('./routes/bookings');
const theatresRouter  = require('./routes/theatres');
const authRouter      = require('./routes/auth');
const authMiddleware  = require('./middleware/authMiddleware');

const app = express();

app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api/movies',    moviesRouter);
app.use('/api/showtimes', showtimesRouter);
app.use('/api/seats',     seatsRouter);
app.use('/api/theatres',  theatresRouter);
app.use('/api/auth',      authRouter);

// Bookings: GET is public (order history lookup), POST requires auth
app.use('/api/bookings', (req, res, next) => {
  if (req.method === 'POST') return authMiddleware(req, res, next);
  next();
}, bookingsRouter);

app.listen(5174, () => {
  console.log('Backend running on http://localhost:5174');
});
