-- Run once after schema: psql cinebox -f backend/db/seed.sql

-- Movies
INSERT INTO movies (id, title, poster_url, backdrop_url, genre, rating, duration_mins, synopsis) VALUES
  ('m1', 'Dhurandhar',
    'https://image.tmdb.org/t/p/w600_and_h900_face/84vTL97U8FKRNIK6mgc6jXyqyJk.jpg',
    'https://image.tmdb.org/t/p/original/84vTL97U8FKRNIK6mgc6jXyqyJk.jpg',
    ARRAY['Action','Thriller'], 'UA', 150,
    'A mysterious traveler slips into the heart of Karachi''s underbelly and rises through its ranks with lethal precision, only to tear the notorious ISI-Underworld nexus apart from within.'),
  ('m2', 'Dune: Part Two',
    'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    ARRAY['Sci-Fi','Adventure'], 'UA', 166,
    'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.'),
  ('m3', 'The Dark Knight',
    'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    'https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsYRSIYjXe.jpg',
    ARRAY['Action','Crime'], 'UA', 152,
    'Batman raises the stakes in his war on crime as the Joker wreaks havoc and chaos on the people of Gotham.'),
  ('m4', 'Yeh Jawaani Hai Deewani',
    'https://image.tmdb.org/t/p/w600_and_h900_face/em39H81XLCDgXsI7V4IcBZseEO6.jpg',
    'https://image.tmdb.org/t/p/original/yGKCMkyRHjOu9bxlKPkBGSiMxnF.jpg',
    ARRAY['Romance','Drama'], 'UA', 160,
    'A free-spirited traveller and a studious girl meet on a trek to Manali, setting off a journey of love, friendship, and self-discovery.'),
  ('m5', 'Rockstar',
    'https://media.themoviedb.org/t/p/w300_and_h450_face/cJZC9riwrdATBUonkZJZD6y9g40.jpg',
    'https://media.themoviedb.org/t/p/w300_and_h450_face/cJZC9riwrdATBUonkZJZD6y9g40.jpg',
    ARRAY['Romance','Drama','Music'], 'UA', 159,
    'A small-town boy''s journey to become a rock legend is intertwined with a passionate and turbulent love story that transforms him forever.'),
  ('m6', 'Bhaag Milkha Bhaag',
    'https://image.tmdb.org/t/p/w600_and_h900_face/bXywc0CEzS1fIshPWWi4V8A58U3.jpg',
    'https://image.tmdb.org/t/p/w600_and_h900_face/bXywc0CEzS1fIshPWWi4V8A58U3.jpg',
    ARRAY['Biography','Drama','Sport'], 'UA', 186,
    'The inspiring true story of Milkha Singh, the Flying Sikh, who overcame a traumatic past to become one of India''s greatest track athletes.')
ON CONFLICT (id) DO NOTHING;

-- Theatres
INSERT INTO theatres (id, name, address, city, amenities) VALUES
  ('th1', 'PVR: Saket Select City Walk', 'A-3, District Centre, Saket', 'New Delhi',
    ARRAY['4DX','Dolby Atmos','Recliner Seats','Food Court']),
  ('th2', 'INOX: Nehru Place', 'Ansal Plaza, Nehru Place', 'New Delhi',
    ARRAY['IMAX','Dolby Atmos','Wheelchair Access']),
  ('th3', 'PVR: Phoenix Palladium', '462, Senapati Bapat Marg, Lower Parel', 'Mumbai',
    ARRAY['4DX','Dolby Atmos','Premium Lounge','Recliner Seats']),
  ('th4', 'Cinepolis: DLF Mall of India', 'DLF Mall of India, Sector 18, Noida', 'Noida',
    ARRAY['4K Laser','Dolby Atmos','D-BOX Seats','Food Court'])
ON CONFLICT (id) DO NOTHING;

-- Screens
INSERT INTO screens (id, theatre_id, name, total_rows, seats_per_row) VALUES
  ('sc1', 'th1', 'Audi 1',            10, 20),
  ('sc2', 'th1', 'Audi 2 – 4DX',      8,  18),
  ('sc3', 'th1', 'Audi 3 – Recliner', 6,  12),
  ('sc4', 'th2', 'Screen 1 – IMAX',   12, 24),
  ('sc5', 'th2', 'Screen 2',           8,  20),
  ('sc6', 'th3', 'Gold Lounge',        5,  10),
  ('sc7', 'th3', 'Audi 1 – 4DX',      8,  20),
  ('sc8', 'th4', 'Audi 1 – 4K Laser', 10, 20),
  ('sc9', 'th4', 'D-BOX Screen',       6,  12)
ON CONFLICT (id) DO NOTHING;

-- Showtimes
INSERT INTO showtimes (id, movie_id, screen_id, starts_at, price_per_seat) VALUES
  ('st1',  'm1', 'sc1', '2026-04-10T10:00:00+05:30', 300),
  ('st2',  'm1', 'sc4', '2026-04-10T14:00:00+05:30', 450),
  ('st3',  'm1', 'sc7', '2026-04-11T19:00:00+05:30', 400),
  ('st4',  'm2', 'sc4', '2026-04-10T14:30:00+05:30', 450),
  ('st5',  'm2', 'sc2', '2026-04-11T18:00:00+05:30', 400),
  ('st6',  'm3', 'sc1', '2026-04-10T20:00:00+05:30', 250),
  ('st7',  'm3', 'sc5', '2026-04-11T20:30:00+05:30', 300),
  ('st8',  'm4', 'sc3', '2026-04-10T12:00:00+05:30', 350),
  ('st9',  'm4', 'sc6', '2026-04-10T17:30:00+05:30', 400),
  ('st10', 'm4', 'sc5', '2026-04-11T21:00:00+05:30', 300),
  ('st11', 'm5', 'sc2', '2026-04-10T13:00:00+05:30', 350),
  ('st12', 'm5', 'sc6', '2026-04-10T18:00:00+05:30', 400),
  ('st13', 'm5', 'sc7', '2026-04-11T20:00:00+05:30', 350),
  ('st14', 'm6', 'sc3', '2026-04-10T11:30:00+05:30', 300),
  ('st15', 'm6', 'sc1', '2026-04-10T16:00:00+05:30', 300),
  ('st16', 'm6', 'sc5', '2026-04-11T19:30:00+05:30', 300),
  ('st17', 'm1', 'sc8', '2026-04-10T11:00:00+05:30', 350),
  ('st18', 'm3', 'sc9', '2026-04-10T15:00:00+05:30', 400),
  ('st19', 'm5', 'sc8', '2026-04-11T19:00:00+05:30', 350)
ON CONFLICT (id) DO NOTHING;
