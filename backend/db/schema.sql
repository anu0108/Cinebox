-- Run to set up fresh: psql $DATABASE_URL -f backend/db/schema.sql

-- Drop in reverse dependency order
DROP TABLE IF EXISTS bookings  CASCADE;
DROP TABLE IF EXISTS showtimes CASCADE;
DROP TABLE IF EXISTS screens   CASCADE;
DROP TABLE IF EXISTS theatres  CASCADE;
DROP TABLE IF EXISTS movies    CASCADE;
DROP TABLE IF EXISTS users     CASCADE;

CREATE TABLE movies (
  id            VARCHAR(10)  PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  poster_url    TEXT,
  backdrop_url  TEXT,
  genre         TEXT[]       NOT NULL DEFAULT '{}',
  rating        VARCHAR(10),
  duration_mins INT,
  synopsis      TEXT
);

CREATE TABLE theatres (
  id        VARCHAR(10)  PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  address   TEXT,
  city      VARCHAR(100),
  amenities TEXT[]       NOT NULL DEFAULT '{}'
);

CREATE TABLE screens (
  id            VARCHAR(10)  PRIMARY KEY,
  theatre_id    VARCHAR(10)  NOT NULL REFERENCES theatres(id),
  name          VARCHAR(100) NOT NULL,
  total_rows    INT          NOT NULL,
  seats_per_row INT          NOT NULL
);

CREATE TABLE showtimes (
  id             VARCHAR(10)  PRIMARY KEY,
  movie_id       VARCHAR(10)  NOT NULL REFERENCES movies(id),
  screen_id      VARCHAR(10)  NOT NULL REFERENCES screens(id),
  -- show_time + days_from_now keeps showtimes perpetually in the future.
  -- starts_at is computed at query time: CURRENT_DATE + days_from_now + show_time
  show_time      TIME         NOT NULL,
  days_from_now  INT          NOT NULL DEFAULT 0,
  price_per_seat INT          NOT NULL
);

CREATE TABLE users (
  id            SERIAL       PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
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
