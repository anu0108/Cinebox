const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../db/pool');

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = '7d';

const COOKIE_OPTIONS = {
  httpOnly: true,                                      // JS cannot read this cookie — blocks XSS
  sameSite: 'strict',                                  // Not sent on cross-site requests — blocks CSRF
  secure:   process.env.NODE_ENV === 'production',     // HTTPS only in prod; plain HTTP ok in dev
  maxAge:   7 * 24 * 60 * 60 * 1000,                  // 7 days in ms
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'name, email, and password are required' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const { rows: existing } = await pool.query(
      `SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]
    );
    if (existing.length)
      return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email.toLowerCase(), passwordHash]
    );

    const user  = rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'email and password are required' });

  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, password_hash AS "passwordHash"
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (!rows.length)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user       = rows[0];
    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk)
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getMe = (req, res) => {
  // req.user is set by authMiddleware — just return it
  res.json({ user: req.user });
};

const logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ message: 'Logged out' });
};

module.exports = { register, login, getMe, logout };
