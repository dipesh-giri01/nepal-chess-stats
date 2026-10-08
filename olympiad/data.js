const trend = {
  years: [2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2022, 2024, 2026],
  open: {
    age: [34.5, 38.4, 34.0, 42.8, 34.8, 37.2, 37.8, 28.8, 29.2, 31.8, 29.6],
    rating: [
      2170.6, 2180.2, 2021.8, 2068.2, 2013.6, 2035.0, 2046.8, 2094.6, 2082.6, 2085.8, 2051.4,
    ],
    rank: [105, 101, 108, 107, 113, 114, 120, 111, 86, 112, 126],
  },
  women: {
    age: [null, null, null, null, null, 19.6, 24.8, 24.8, 24.6, 27.6, 25.2],
    rating: [null, null, null, null, null, 1646.8, 1625.4, 1530.0, 1549.4, 1692.0, 1642.0],
    rank: [null, null, null, null, null, 115, 113, 117, 94, 119, 130],
  },
};
const comparison = {
  open: {
    editions_competed: 9,
    avg_age: 35.3,
    avg_rating: 2079.3,
    best_rank: 86,
    worst_rank: 120,
    avg_rank: 107.2,
  },
  women: {
    editions_competed: 4,
    avg_age: 23.5,
    avg_rating: 1587.9,
    best_rank: 94,
    worst_rank: 117,
    avg_rank: 109.8,
  },
};
const continuity = {
  open: [
    { year: 2004, returning: 0, new: 6, squad_size: 6, participation: 'competed' },
    { year: 2006, returning: 4, new: 1, squad_size: 5, participation: 'competed' },
    { year: 2008, returning: 0, new: 4, squad_size: 4, participation: 'competed' },
    { year: 2010, returning: 0, new: 5, squad_size: 5, participation: 'competed' },
    { year: 2012, returning: 2, new: 3, squad_size: 5, participation: 'competed' },
    { year: 2014, returning: 2, new: 3, squad_size: 5, participation: 'competed' },
    { year: 2016, returning: 2, new: 3, squad_size: 5, participation: 'competed' },
    { year: 2018, returning: 0, new: 5, squad_size: 5, participation: 'competed' },
    { year: 2022, returning: 2, new: 3, squad_size: 5, participation: 'competed' },
    { year: 2024, returning: 3, new: 2, squad_size: 5, participation: 'registered_only' },
    { year: 2026, returning: 3, new: 2, squad_size: 5, participation: 'provisional' },
  ],
  women: [
    { year: 2014, returning: 0, new: 5, squad_size: 5, participation: 'competed' },
    { year: 2016, returning: 2, new: 3, squad_size: 5, participation: 'competed' },
    { year: 2018, returning: 3, new: 2, squad_size: 5, participation: 'competed' },
    { year: 2022, returning: 1, new: 4, squad_size: 5, participation: 'competed' },
    { year: 2024, returning: 2, new: 3, squad_size: 5, participation: 'registered_only' },
    { year: 2026, returning: 3, new: 2, squad_size: 5, participation: 'provisional' },
  ],
};
