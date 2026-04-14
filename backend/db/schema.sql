-- Run once: psql cinebox -f backend/db/schema.sql

CREATE TABLE IF NOT EXISTS movies (
  id            VARCHAR(10)  PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  poster_url    TEXT,
  backdrop_url  TEXT,
  genre         TEXT[]       NOT NULL DEFAULT '{}',
  rating        VARCHAR(10),
  duration_mins INT,
  synopsis      TEXT
);

CREATE TABLE IF NOT EXISTS theatres (
  id        VARCHAR(10)  PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  address   TEXT,
  city      VARCHAR(100),
  amenities TEXT[]       NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS screens (
  id            VARCHAR(10)  PRIMARY KEY,
  theatre_id    VARCHAR(10)  NOT NULL REFERENCES theatres(id),
  name          VARCHAR(100) NOT NULL,
  total_rows    INT          NOT NULL,
  seats_per_row INT          NOT NULL
);

CREATE TABLE IF NOT EXISTS showtimes (
  id             VARCHAR(10)  PRIMARY KEY,
  movie_id       VARCHAR(10)  NOT NULL REFERENCES movies(id),
  screen_id      VARCHAR(10)  NOT NULL REFERENCES screens(id),
  starts_at      TIMESTAMPTZ  NOT NULL,
  price_per_seat INT          NOT NULL
);

-- users table is ready for auth (JWT login/signup)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL       PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id           VARCHAR(20)  PRIMARY KEY,
  showtime_id  VARCHAR(10)  NOT NULL REFERENCES showtimes(id),
  movie_id     VARCHAR(10)  NOT NULL,
  movie_title  VARCHAR(255) NOT NULL,
  starts_at    TIMESTAMPTZ  NOT NULL,
  hall         VARCHAR(100),
  theatre_id   VARCHAR(10),
  theatre_name VARCHAR(255),
  city         VARCHAR(100),
  seats        TEXT[]       NOT NULL,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  total_price  INT          NOT NULL,
  booked_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
