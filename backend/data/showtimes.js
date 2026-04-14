// screenId replaces hall/totalRows/seatsPerRow — those now live on the Screen entity
// Theatre → Screen → Showtime is the correct hierarchy
const showtimes = [
  // Dhurandhar (m1)
  { id: "st1",  movieId: "m1", screenId: "sc1", startsAt: "2026-04-10T10:00:00", pricePerSeat: 300 },
  { id: "st2",  movieId: "m1", screenId: "sc4", startsAt: "2026-04-10T14:00:00", pricePerSeat: 450 },
  { id: "st3",  movieId: "m1", screenId: "sc7", startsAt: "2026-04-11T19:00:00", pricePerSeat: 400 },

  // Dune: Part Two (m2)
  { id: "st4",  movieId: "m2", screenId: "sc4", startsAt: "2026-04-10T14:30:00", pricePerSeat: 450 },
  { id: "st5",  movieId: "m2", screenId: "sc2", startsAt: "2026-04-11T18:00:00", pricePerSeat: 400 },

  // The Dark Knight (m3)
  { id: "st6",  movieId: "m3", screenId: "sc1", startsAt: "2026-04-10T20:00:00", pricePerSeat: 250 },
  { id: "st7",  movieId: "m3", screenId: "sc5", startsAt: "2026-04-11T20:30:00", pricePerSeat: 300 },

  // Yeh Jawaani Hai Deewani (m4)
  { id: "st8",  movieId: "m4", screenId: "sc3", startsAt: "2026-04-10T12:00:00", pricePerSeat: 350 },
  { id: "st9",  movieId: "m4", screenId: "sc6", startsAt: "2026-04-10T17:30:00", pricePerSeat: 400 },
  { id: "st10", movieId: "m4", screenId: "sc5", startsAt: "2026-04-11T21:00:00", pricePerSeat: 300 },

  // Rockstar (m5)
  { id: "st11", movieId: "m5", screenId: "sc2", startsAt: "2026-04-10T13:00:00", pricePerSeat: 350 },
  { id: "st12", movieId: "m5", screenId: "sc6", startsAt: "2026-04-10T18:00:00", pricePerSeat: 400 },
  { id: "st13", movieId: "m5", screenId: "sc7", startsAt: "2026-04-11T20:00:00", pricePerSeat: 350 },

  // Bhaag Milkha Bhaag (m6)
  { id: "st14", movieId: "m6", screenId: "sc3", startsAt: "2026-04-10T11:30:00", pricePerSeat: 300 },
  { id: "st15", movieId: "m6", screenId: "sc1", startsAt: "2026-04-10T16:00:00", pricePerSeat: 300 },
  { id: "st16", movieId: "m6", screenId: "sc5", startsAt: "2026-04-11T19:30:00", pricePerSeat: 300 },
  // Cinepolis showtimes
  { id: "st17", movieId: "m1", screenId: "sc8", startsAt: "2026-04-10T11:00:00", pricePerSeat: 350 },
  { id: "st18", movieId: "m3", screenId: "sc9", startsAt: "2026-04-10T15:00:00", pricePerSeat: 400 },
  { id: "st19", movieId: "m5", screenId: "sc8", startsAt: "2026-04-11T19:00:00", pricePerSeat: 350 },
];

module.exports = showtimes;
