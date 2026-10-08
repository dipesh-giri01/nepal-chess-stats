const NAVY = '#1D1E3E';
const CORAL = '#C17A12';
const MUTED = '#6A645C';
const HAIR = '#D1C6B8';

Chart.register(ChartDataLabels);
Chart.defaults.plugins.datalabels = { display: false };
Chart.defaults.animation = {
  duration: 700,
  easing: 'easeOutQuart',
};
Chart.defaults.animations = {
  colors: false,
  numbers: { type: 'number', properties: ['x', 'y', 'base', 'width', 'height', 'r'] },
};
Chart.defaults.datasets.bar.categoryPercentage = 0.62;
Chart.defaults.datasets.bar.barPercentage = 0.72;
Chart.defaults.datasets.bar.borderSkipped = false;

function fmtNum(v) {
  if (v == null || Number.isNaN(v)) return '';
  if (typeof v === 'number')
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10);
  return String(v);
}
function valueLabels(extra = {}) {
  return Object.assign(
    {
      display: true,
      color: MUTED,
      font: { family: "'IBM Plex Sans'", size: 10, weight: '500' },
      clamp: true,
      clip: false,
      formatter(value) {
        if (value == null) return null;
        if (Array.isArray(value)) return `${fmtNum(value[0])}–${fmtNum(value[1])}`;
        if (typeof value === 'object') {
          if (value.y == null) return null;
          return fmtNum(value.y);
        }
        return fmtNum(value);
      },
    },
    extra,
  );
}

let sectionFilter = 'all';
const show = (s) => sectionFilter === 'all' || sectionFilter === s;

// ---- scoreboard ----
function renderScoreboard() {
  const boards = {
    all: [
      { num: '9', label: 'Open editions competed, 2004\u20132022' },
      { num: '86th', label: 'Best-ever finish, Open, 2022 Chennai' },
      { num: '45', label: 'Unique players across the whole record' },
      { num: '19', label: 'Players with more than one appearance' },
    ],
    open: [
      { num: '9', label: 'Open editions competed, 2004\u20132022' },
      { num: '86th', label: 'Best-ever finish, 2022 Chennai' },
      { num: '107.2', label: 'Average final rank across competed editions' },
      { num: '2079', label: 'Average squad rating' },
    ],
    women: [
      { num: '4', label: 'Women editions competed, 2014\u20132022' },
      { num: '94th', label: 'Best-ever finish, 2022 Chennai' },
      { num: '109.8', label: 'Average final rank across competed editions' },
      { num: '1588', label: 'Average squad rating' },
    ],
  };
  document.getElementById('scoreboard').innerHTML = boards[sectionFilter]
    .map(
      (s) =>
        `<div class="stat"><div class="stat-num">${s.num}</div><div class="stat-label">${s.label}</div></div>`,
    )
    .join('');
}

// ---- trend chart ----
const yearLabels = trend.years.map((y) => (y === 2024 || y === 2026 ? y + '*' : String(y)));
const provisionalFromIdx = trend.years.indexOf(2024) - 1;
function dashSeg(ctx) {
  return ctx.p0DataIndex >= provisionalFromIdx ? [5, 4] : undefined;
}
let trendMetric = 'age';

const trendChart = new Chart(document.getElementById('trendChart'), {
  type: 'line',
  data: {
    labels: yearLabels,
    datasets: [
      {
        label: 'Open',
        data: trend.open.age,
        borderColor: NAVY,
        backgroundColor: NAVY,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        segment: { borderDash: dashSeg },
        spanGaps: true,
      },
      {
        label: 'Women',
        data: trend.women.age,
        borderColor: CORAL,
        backgroundColor: CORAL,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        segment: { borderDash: dashSeg },
        spanGaps: true,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 22, right: 16, left: 8, bottom: 4 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (c) =>
            c.dataset.label + ': ' + (c.parsed.y === null ? 'no team fielded' : c.parsed.y),
        },
      },
      datalabels: valueLabels({
        anchor: 'end',
        offset: 6,
        align(ctx) {
          const n = ctx.dataset.data.length;
          if (ctx.dataIndex === 0) return 25; // nudge into the plot
          if (ctx.dataIndex === n - 1) return 155;
          return 'top';
        },
        display(ctx) {
          const v = ctx.dataset.data[ctx.dataIndex];
          return v != null && !ctx.dataset.hidden;
        },
        formatter(value) {
          if (value == null) return null;
          // ratings/ranks as whole numbers; ages keep one decimal
          if (typeof value === 'number' && Math.abs(value) >= 100) return String(Math.round(value));
          return fmtNum(value);
        },
      }),
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Average age',
          color: MUTED,
          font: { family: "'IBM Plex Sans'", size: 12 },
        },
        grid: { color: HAIR },
        ticks: { color: MUTED, maxTicksLimit: 7, padding: 6 },
      },
      x: {
        offset: true,
        grid: { display: false },
        ticks: { color: MUTED, padding: 4 },
      },
    },
  },
});

const insights = {
  age: {
    all: "Open squad age fell from a veteran-heavy 42.8 average in 2010 to under 29 by 2018, and has stayed there. Women's squads have been consistently young since the 2014 debut, 20 to 28.",
    open: 'Open squad age fell from a veteran-heavy 42.8 average in 2010 to under 29 by 2018, and has stayed in the high 20s / low 30s since.',
    women:
      "Women's squads have been consistently young since the 2014 debut, averaging 20 to 28 across competed editions.",
  },
  rating: {
    all: 'Squad rating has stayed roughly flat for both sections across two decades, no clear rise or fall, while final rank moved independently of it.',
    open: 'Open squad rating has stayed roughly flat across two decades, hovering around 2050\u20132180, while final rank moved independently of it.',
    women:
      "Women's squad rating has stayed roughly flat since the 2014 debut, around 1530\u20131690, while final rank moved independently of it.",
  },
  rank: {
    all: 'Both sections hit their best-ever finish in the same year, 2022, without a stronger roster on paper. Form and preparation mattered more than rating that year.',
    open: 'Open hit its best-ever finish in 2022 (86th), without a stronger roster on paper than earlier cycles.',
    women: 'Women hit their best-ever finish in 2022 (94th), climbing from a 115th debut in 2014.',
  },
};

function updateTrend() {
  trendChart.data.datasets[0].data = trend.open[trendMetric];
  trendChart.data.datasets[1].data = trend.women[trendMetric];
  trendChart.getDatasetMeta(0).hidden = !show('open');
  trendChart.getDatasetMeta(1).hidden = !show('women');
  const titles = {
    age: 'Average age',
    rating: 'Average FIDE rating',
    rank: 'Final rank (lower is better)',
  };
  trendChart.options.scales.y.title.text = titles[trendMetric];
  trendChart.options.scales.y.reverse = trendMetric === 'rank';
  trendChart.update();
  document.getElementById('trend-insight').textContent = insights[trendMetric][sectionFilter];
}

document.querySelectorAll('[data-metric]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-metric]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    trendMetric = btn.dataset.metric;
    updateTrend();
  });
});

// ---- roster continuity ----
function contChart(elId, data) {
  const labels = data.map((d) => (d.participation === 'competed' ? String(d.year) : d.year + '*'));
  return new Chart(document.getElementById(elId), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Returning',
          data: data.map((d) => d.returning),
          backgroundColor: NAVY,
          borderRadius: 3,
          maxBarThickness: 28,
          categoryPercentage: 0.55,
          barPercentage: 0.7,
        },
        {
          label: 'New',
          data: data.map((d) => d.new),
          backgroundColor: HAIR,
          borderRadius: 3,
          maxBarThickness: 28,
          categoryPercentage: 0.55,
          barPercentage: 0.7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 14 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            afterBody: (items) => {
              const d = data[items[0].dataIndex];
              if (d.participation === 'registered_only')
                return 'Registered but did not travel (visa)';
              if (d.participation === 'provisional')
                return 'Provisional squad, Samarkand starts 16 Sep 2026';
              return null;
            },
          },
        },
        datalabels: valueLabels({
          color: '#221E20',
          font: { family: "'IBM Plex Sans'", size: 10, weight: '600' },
          anchor: 'center',
          align: 'center',
          display(ctx) {
            const v = ctx.dataset.data[ctx.dataIndex];
            return v != null && v > 0;
          },
        }),
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: MUTED } },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: HAIR },
          ticks: { color: MUTED, stepSize: 1 },
        },
      },
    },
  });
}
contChart('contOpenChart', continuity.open);
contChart('contWomenChart', continuity.women);

const continuityInsights = {
  all: "Open: 2018 fielded five entirely new players, nobody from 2016, and still finished better (111th) than the 2016 squad that had kept two starters (120th). The 2022 breakthrough (86th) came with three new faces out of five. Women: the most continuous squad, 2018 with three returners, finished worse (117th) than 2016's two-returner side (113th). Their best result, 94th in 2022, came with four newcomers out of five. Turnover is not what is holding Nepal back. 2024* never traveled (visa); 2026* is provisional for Samarkand.",
  open: "2018's Open squad was five entirely new players, no one who played 2016, and it still placed better (111th) than the 2016 squad that had kept two starters (120th). 2022's breakthrough (86th, best ever) came with three new faces out of five. Continuity does not track results here.",
  women:
    "2018's Women's squad kept three players from 2016, the highest continuity in the section, and finished worse (117th) than 2016's two-returner side (113th). The breakthrough year, 2022, brought four new faces out of five and finished 94th, the best Women's result on record. More returners have not meant better finishes.",
};

function updateContinuityPanels() {
  document.querySelectorAll('[data-section-panel]').forEach((el) => {
    const s = el.dataset.sectionPanel;
    el.classList.toggle('is-hidden', !show(s));
  });
  document.getElementById('continuity-insight').textContent = continuityInsights[sectionFilter];
}

// ---- age/rating extremes per squad ----
const extremes = [
  {
    year: 2004,
    section: 'open',
    participation: 'competed',
    oldest_name: 'Shrestha Rajendra',
    oldest_age: 48.0,
    youngest_name: 'Digesh Shanker Malla',
    youngest_age: 24.0,
    age_spread: 24.0,
    highest_name: 'Digesh Shanker Malla',
    highest_rating: 2253,
    lowest_name: 'Surbir Lama',
    lowest_rating: 2112,
    rating_spread: 141,
  },
  {
    year: 2006,
    section: 'open',
    participation: 'competed',
    oldest_name: 'Shrestha Rajendra Prasad',
    oldest_age: 49.0,
    youngest_name: 'Malla Digesh Shanker',
    youngest_age: 25.0,
    age_spread: 24.0,
    highest_name: 'Malla Digesh Shanker',
    highest_rating: 2257,
    lowest_name: 'Shrestha Rajendra Prasad',
    lowest_rating: 2138,
    rating_spread: 119,
  },
  {
    year: 2008,
    section: 'open',
    participation: 'competed',
    oldest_name: 'Sujendra Prasad Sherstha',
    oldest_age: 42.0,
    youngest_name: 'Manish Hamal',
    youngest_age: 23.0,
    age_spread: 19.0,
    highest_name: 'Surbir Lama',
    highest_rating: 2083,
    lowest_name: 'Balram Napit',
    lowest_rating: 1909,
    rating_spread: 174,
  },
  {
    year: 2010,
    section: 'open',
    participation: 'competed',
    oldest_name: 'Malakar Prachand Man',
    oldest_age: 47.0,
    youngest_name: 'Thapa Uttam Raj',
    youngest_age: 34.0,
    age_spread: 13.0,
    highest_name: 'Nepali Badrilal',
    highest_rating: 2135,
    lowest_name: 'Malakar Prachand Man',
    lowest_rating: 1959,
    rating_spread: 176,
  },
  {
    year: 2012,
    section: 'open',
    participation: 'competed',
    oldest_name: 'Malakar Prachanda Man',
    oldest_age: 49.0,
    youngest_name: 'Jaiswal Rupesh',
    youngest_age: 15.0,
    age_spread: 34.0,
    highest_name: 'Shrestha Keshav',
    highest_rating: 2127,
    lowest_name: 'Joshi Deergh Raj',
    lowest_rating: 1897,
    rating_spread: 230,
  },
  {
    year: 2014,
    section: 'open',
    participation: 'competed',
    oldest_name: 'Shrestha Sujendra Prasad',
    oldest_age: 48.0,
    youngest_name: 'Maharjan Sajin',
    youngest_age: 25.0,
    age_spread: 23.0,
    highest_name: 'Shrestha Keshav',
    highest_rating: 2137,
    lowest_name: 'Shrestha Sujendra Prasad',
    lowest_rating: 1930,
    rating_spread: 207,
  },
  {
    year: 2014,
    section: 'women',
    participation: 'competed',
    oldest_name: 'Khamboo Monalisa',
    oldest_age: 23.0,
    youngest_name: 'Thing Suruchee',
    youngest_age: 16.0,
    age_spread: 7.0,
    highest_name: 'Khamboo Monalisa',
    highest_rating: 1772,
    lowest_name: 'Thing Suruchee',
    lowest_rating: 1540,
    rating_spread: 232,
  },
  {
    year: 2016,
    section: 'open',
    participation: 'competed',
    oldest_name: 'Shrestha Bilam Lal',
    oldest_age: 53.0,
    youngest_name: 'Maharjan Sajin',
    youngest_age: 27.0,
    age_spread: 26.0,
    highest_name: 'Shrestha Keshav',
    highest_rating: 2099,
    lowest_name: 'Bhandari Kshitiz',
    lowest_rating: 2013,
    rating_spread: 86,
  },
  {
    year: 2016,
    section: 'women',
    participation: 'competed',
    oldest_name: 'Joshi Sindira',
    oldest_age: 34.0,
    youngest_name: 'Lohani Sujana',
    youngest_age: 18.0,
    age_spread: 16.0,
    highest_name: 'Khamboo Monalisa',
    highest_rating: 1740,
    lowest_name: 'Lohani Sujana',
    lowest_rating: 1488,
    rating_spread: 252,
  },
  {
    year: 2018,
    section: 'open',
    participation: 'competed',
    oldest_name: 'Rajbhandari Rijendra',
    oldest_age: 45.0,
    youngest_name: 'Jaiswal Rupesh',
    youngest_age: 21.0,
    age_spread: 24.0,
    highest_name: 'Thing Bibek',
    highest_rating: 2237,
    lowest_name: 'Rajbhandari Rijendra',
    lowest_rating: 1937,
    rating_spread: 300,
  },
  {
    year: 2018,
    section: 'women',
    participation: 'competed',
    oldest_name: 'Joshi Sindira',
    oldest_age: 36.0,
    youngest_name: 'Thapa Khusbu',
    youngest_age: 15.0,
    age_spread: 21.0,
    highest_name: 'Khamboo Monalisha',
    highest_rating: 1704,
    lowest_name: 'Thapa Khusbu',
    lowest_rating: 1411,
    rating_spread: 293,
  },
  {
    year: 2022,
    section: 'open',
    participation: 'competed',
    oldest_name: 'Chaulagain Purushottam',
    oldest_age: 37.0,
    youngest_name: 'Lama Milan',
    youngest_age: 22.0,
    age_spread: 15.0,
    highest_name: 'Thing Bibek',
    highest_rating: 2260,
    lowest_name: 'Chaulagain Purushottam',
    lowest_rating: 1975,
    rating_spread: 285,
  },
  {
    year: 2022,
    section: 'women',
    participation: 'competed',
    oldest_name: 'Dhimal Shanti',
    oldest_age: 30.0,
    youngest_name: 'Adhikari Kritisara',
    youngest_age: 20.0,
    age_spread: 10.0,
    highest_name: 'Lohani Sujana',
    highest_rating: 1697,
    lowest_name: 'Neupane Anisha',
    lowest_rating: 1488,
    rating_spread: 209,
  },
  {
    year: 2024,
    section: 'open',
    participation: 'registered_only',
    oldest_name: 'Bhandari Kshitiz',
    oldest_age: 36.0,
    youngest_name: 'Jaiswal Rupesh',
    youngest_age: 27.0,
    age_spread: 9.0,
    highest_name: 'Thing Bibek',
    highest_rating: 2282,
    lowest_name: 'Dahal Sushrut',
    lowest_rating: 2005,
    rating_spread: 277,
  },
  {
    year: 2024,
    section: 'women',
    participation: 'registered_only',
    oldest_name: 'Joshi Sindira',
    oldest_age: 42.0,
    youngest_name: 'Shrestha Riya',
    youngest_age: 15.0,
    age_spread: 27.0,
    highest_name: 'Adhikari Kritisara',
    highest_rating: 1746,
    lowest_name: 'Shrestha Riya',
    lowest_rating: 1640,
    rating_spread: 106,
  },
  {
    year: 2026,
    section: 'open',
    participation: 'provisional',
    oldest_name: 'Subedi Rajan',
    oldest_age: 38.0,
    youngest_name: 'Silwal Purushottam',
    youngest_age: 19.0,
    age_spread: 19.0,
    highest_name: 'Jaiswal Rupesh',
    highest_rating: 2151,
    lowest_name: 'Subedi Rajan',
    lowest_rating: 1967,
    rating_spread: 184,
  },
  {
    year: 2026,
    section: 'women',
    participation: 'provisional',
    oldest_name: 'Joshi Sindira',
    oldest_age: 44.0,
    youngest_name: 'Shrestha Nihana',
    youngest_age: 13.0,
    age_spread: 31.0,
    highest_name: 'Adhikari Kritisara',
    highest_rating: 1744,
    lowest_name: 'Joshi Sindira',
    lowest_rating: 1565,
    rating_spread: 179,
  },
];

let extremeMetric = 'age';
let extremeChart;
function renderExtremes() {
  const rows = extremes.filter((r) => show(r.section));
  const labels = rows.map(
    (r) =>
      `${r.year} ${r.section === 'open' ? 'Open' : 'Women'}${r.participation !== 'competed' ? '*' : ''}`,
  );
  const colors = rows.map((r) => (r.section === 'open' ? NAVY : CORAL));
  let data, lowNames, highNames, axisTitle;
  if (extremeMetric === 'age') {
    data = rows.map((r) => [r.youngest_age, r.oldest_age]);
    lowNames = rows.map((r) => r.youngest_name);
    highNames = rows.map((r) => r.oldest_name);
    axisTitle = 'Age';
  } else {
    data = rows.map((r) => [r.lowest_rating, r.highest_rating]);
    lowNames = rows.map((r) => r.lowest_name);
    highNames = rows.map((r) => r.highest_name);
    axisTitle = 'FIDE rating';
  }
  if (extremeChart) extremeChart.destroy();
  const boxH = Math.max(420, rows.length * 34 + 80);
  document.getElementById('extremeBox').style.height = boxH + 'px';
  extremeChart = new Chart(document.getElementById('extremeChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderRadius: 3,
          barThickness: 12,
          categoryPercentage: 0.68,
          barPercentage: 0.75,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 48 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => [
              `Low: ${lowNames[c.dataIndex]} (${c.raw[0]})`,
              `High: ${highNames[c.dataIndex]} (${c.raw[1]})`,
            ],
          },
        },
        datalabels: valueLabels({
          anchor: 'end',
          align: 'right',
          offset: 4,
          formatter(value) {
            return Array.isArray(value) ? `${fmtNum(value[0])}–${fmtNum(value[1])}` : fmtNum(value);
          },
        }),
      },
      scales: {
        x: {
          title: {
            display: true,
            text: axisTitle,
            color: MUTED,
            font: { family: "'IBM Plex Sans'", size: 12 },
          },
          grid: { color: HAIR },
          ticks: { color: MUTED },
        },
        y: { grid: { display: false }, ticks: { color: MUTED, font: { size: 11 } } },
      },
    },
  });
  const ageText = {
    all: "Widest age gap in the whole record: 2026's provisional Women's squad, 13 to 44: Nihana Shrestha to Sindira Joshi, 31 years apart. 2012 Open (Jaiswal Rupesh, 15, to Malakar, 49) is the widest actually-played squad, 34 years.",
    open: 'Widest Open age gap actually played: 2012, Jaiswal Rupesh (15) to Malakar (49), 34 years. Provisional 2026 Open spans 19 years (Silwal 19 to Subedi 38).',
    women:
      "Widest Women's age gap in the whole record: 2026's provisional squad, 13 to 44: Nihana Shrestha to Sindira Joshi, 31 years. Among competed editions, 2018 spans 21 years (Thapa Khusbu 15 to Joshi Sindira 36).",
  };
  const ratingText = {
    all: 'Widest rating gap in a competed squad: 2018 Open, 300 points from Rajbhandari Rijendra (1937) to Thing Bibek (2237). Women run almost as wide: 293 points in 2018 (Thapa Khusbu 1411 to Khamboo Monalisha 1704) and 252 in 2016. Thin depth at the top of the national lists shows up as long bars, not as a smooth pack.',
    open: 'Widest Open rating gap: 2018, 300 points between Rajbhandari Rijendra (1937) and Thing Bibek (2237). 2022 was nearly as stretched at 285 points (Chaulagain 1975 to Thing Bibek 2260). The board is rarely a balanced five: one strong top board and a much lower floor is the usual shape.',
    women:
      "Widest Women's rating gap among competed editions: 2018, 293 points from Thapa Khusbu (1411) to Khamboo Monalisha (1704). 2016 was 252 points, 2014 was 232. Those spreads track how few rated women Nepal has had to choose from, not a deliberate high\u2013low pairing strategy.",
  };
  document.getElementById('extreme-insight').textContent =
    extremeMetric === 'age' ? ageText[sectionFilter] : ratingText[sectionFilter];
}
document.querySelectorAll('[data-extreme]').forEach((btn) => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('[data-extreme]').forEach((b) => b.classList.remove('active'));
    this.classList.add('active');
    extremeMetric = this.dataset.extreme;
    renderExtremes();
  });
});

// ---- seed vs final rank ----
const seedRows = [
  { year: 2008, section: 'open', seed: 132, final: 108, moved: 24 },
  { year: 2010, section: 'open', seed: 114, final: 107, moved: 7 },
  { year: 2012, section: 'open', seed: 124, final: 113, moved: 11 },
  { year: 2014, section: 'open', seed: 128, final: 114, moved: 14 },
  { year: 2016, section: 'open', seed: 127, final: 120, moved: 7 },
  { year: 2018, section: 'open', seed: 118, final: 111, moved: 7 },
  { year: 2022, section: 'open', seed: 107, final: 86, moved: 21 },
  { year: 2024, section: 'open', seed: 112, final: null },
  { year: 2014, section: 'women', seed: 100, final: 115, moved: -15 },
  { year: 2016, section: 'women', seed: 109, final: 113, moved: -4 },
  { year: 2018, section: 'women', seed: 116, final: 117, moved: -1 },
  { year: 2022, section: 'women', seed: 101, final: 94, moved: 7 },
  { year: 2024, section: 'women', seed: 119, final: null },
].filter((r) => r.final !== null);

let seedChart;
function renderSeed() {
  const rows = seedRows.filter((r) => show(r.section));
  const labels = rows.map((r) => `${r.year} ${r.section === 'open' ? 'Open' : 'Women'}`);
  const data = rows.map((r) => [Math.min(r.seed, r.final), Math.max(r.seed, r.final)]);
  const colors = rows.map((r) => (r.seed >= r.final ? NAVY : CORAL));
  const moved = rows.map((r) => r.seed - r.final);
  if (seedChart) seedChart.destroy();
  seedChart = new Chart(document.getElementById('seedChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderRadius: 3,
          barThickness: 18,
          categoryPercentage: 0.7,
          barPercentage: 0.78,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 52 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => {
              const r = rows[c.dataIndex];
              return `Seeded ${r.seed}${r.seed > r.final ? ', finished ' + r.final + ' (+' + moved[c.dataIndex] + ' places)' : r.seed < r.final ? ', finished ' + r.final + ' (' + moved[c.dataIndex] + ' places)' : ', finished where seeded'}`;
            },
          },
        },
        datalabels: valueLabels({
          anchor: 'end',
          align: 'right',
          offset: 4,
          formatter(value, ctx) {
            const r = rows[ctx.dataIndex];
            const delta = moved[ctx.dataIndex];
            const sign = delta > 0 ? '+' : '';
            return `${r.seed}→${r.final} (${sign}${delta})`;
          },
        }),
      },
      scales: {
        x: {
          reverse: true,
          title: {
            display: true,
            text: 'Rank (lower = better)',
            color: MUTED,
            font: { family: "'IBM Plex Sans'", size: 12 },
          },
          grid: { color: HAIR },
          ticks: { color: MUTED },
        },
        y: { grid: { display: false }, ticks: { color: MUTED, font: { size: 11 } } },
      },
    },
  });
  const seedInsights = {
    all: "Nepal's Open team beat its seeding in all 7 editions with usable data, by an average of 13 places, including a 24-place jump in 2008 (seeded 132nd, finished 108th). The Women's section is mixed across 4 editions: \u221215 in 2014, \u22124 in 2016, \u22121 in 2018, then +7 in 2022. 2004 and 2006 Open remain the only competed editions without a clean seed-versus-finish pair here.",
    open: 'Open beat its seeding in all 7 editions with usable data, by an average of 13 places, including a 24-place jump in 2008 (seeded 132nd, finished 108th).',
    women:
      "Women's seeding record is mixed across 4 editions: \u221215 in 2014, \u22124 in 2016, \u22121 in 2018, then +7 in 2022.",
  };
  document.getElementById('seed-insight').textContent = seedInsights[sectionFilter];
}

// ---- field size ----
const fieldData = [
  { year: 2004, section: 'open', nations: 125, teams: 129, nepal_rank: 105, percentile: 19.4 },
  { year: 2004, section: 'women', nations: 84, teams: 87, nepal_rank: null },
  { year: 2006, section: 'open', nations: 143, teams: 148, nepal_rank: 101, percentile: 32.4 },
  { year: 2006, section: 'women', nations: 99, teams: 103, nepal_rank: null },
  { year: 2008, section: 'open', nations: 141, teams: 146, nepal_rank: 108, percentile: 26.7 },
  { year: 2008, section: 'women', nations: 106, teams: 111, nepal_rank: null },
  { year: 2010, section: 'open', nations: 141, teams: 148, nepal_rank: 107, percentile: 28.4 },
  { year: 2010, section: 'women', nations: 110, teams: 115, nepal_rank: null },
  { year: 2012, section: 'open', nations: 152, teams: 157, nepal_rank: 113, percentile: 28.7 },
  { year: 2012, section: 'women', nations: 122, teams: 127, nepal_rank: null },
  { year: 2014, section: 'open', nations: 172, teams: 177, nepal_rank: 114, percentile: 36.2 },
  { year: 2014, section: 'women', nations: 131, teams: 136, nepal_rank: 115, percentile: 16.2 },
  { year: 2016, section: 'open', nations: 175, teams: 180, nepal_rank: 120, percentile: 33.9 },
  { year: 2016, section: 'women', nations: 138, teams: 142, nepal_rank: 113, percentile: 21.1 },
  { year: 2018, section: 'open', nations: 180, teams: 185, nepal_rank: 111, percentile: 40.5 },
  { year: 2018, section: 'women', nations: 146, teams: 151, nepal_rank: 117, percentile: 23.2 },
  { year: 2022, section: 'open', nations: 186, teams: 188, nepal_rank: 86, percentile: 54.8 },
  { year: 2022, section: 'women', nations: 160, teams: 162, nepal_rank: 94, percentile: 42.6 },
  { year: 2024, section: 'open', nations: 195, teams: 197, nepal_rank: null },
  { year: 2024, section: 'women', nations: 181, teams: 183, nepal_rank: null },
  { year: 2026, section: 'open', nations: 205, teams: 208, nepal_rank: null },
  { year: 2026, section: 'women', nations: 188, teams: 192, nepal_rank: null },
];

const fieldYears = [...new Set(fieldData.map((r) => r.year))].sort((a, b) => a - b);
const fieldOpen = fieldYears.map(
  (y) => (fieldData.find((r) => r.year === y && r.section === 'open') || {}).teams ?? null,
);
const fieldWomen = fieldYears.map(
  (y) => (fieldData.find((r) => r.year === y && r.section === 'women') || {}).teams ?? null,
);

const fieldChart = new Chart(document.getElementById('fieldChart'), {
  type: 'bar',
  data: {
    labels: fieldYears.map((y) => (y === 2026 ? y + '*' : String(y))),
    datasets: [
      {
        label: 'Open',
        data: fieldOpen,
        backgroundColor: NAVY,
        borderRadius: 3,
        categoryPercentage: 0.58,
        barPercentage: 0.7,
      },
      {
        label: 'Women',
        data: fieldWomen,
        backgroundColor: CORAL,
        borderRadius: 3,
        categoryPercentage: 0.58,
        barPercentage: 0.7,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 18 } },
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
      datalabels: valueLabels({
        align: 'top',
        anchor: 'end',
        offset: 4,
        display(ctx) {
          const v = ctx.dataset.data[ctx.dataIndex];
          return v != null && !ctx.dataset.hidden;
        },
      }),
    },
    scales: {
      x: { offset: true, grid: { display: false }, ticks: { color: MUTED, padding: 4 } },
      y: {
        title: {
          display: true,
          text: 'Total teams',
          color: MUTED,
          font: { family: "'IBM Plex Sans'", size: 12 },
        },
        grid: { color: HAIR },
        ticks: { color: MUTED, padding: 6, maxTicksLimit: 7 },
      },
    },
  },
});

function updateField() {
  fieldChart.getDatasetMeta(0).hidden = !show('open');
  fieldChart.getDatasetMeta(1).hidden = !show('women');
  fieldChart.update();
  const fieldInsights = {
    all: "The Open field grew from 129 teams (2004) to a provisional 208 (2026 Samarkand), a 61% increase. The Women's field grew even faster, from 87 to a provisional 192, more than doubling.",
    open: 'The Open field grew from 129 teams (2004) to a provisional 208 (2026 Samarkand), a 61% increase.',
    women:
      "The Women's field grew from 87 teams (2004) to a provisional 192 (2026), more than doubling.",
  };
  document.getElementById('field-insight').textContent = fieldInsights[sectionFilter];
}

// ---- percentile ----
const pctRows = fieldData.filter((r) => r.percentile !== undefined);
const percentileChart = new Chart(document.getElementById('percentileChart'), {
  type: 'line',
  data: {
    datasets: [
      {
        label: 'Open',
        data: pctRows
          .filter((r) => r.section === 'open')
          .map((r) => ({ x: r.year, y: r.percentile })),
        borderColor: NAVY,
        backgroundColor: NAVY,
        borderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Women',
        data: pctRows
          .filter((r) => r.section === 'women')
          .map((r) => ({ x: r.year, y: r.percentile })),
        borderColor: CORAL,
        backgroundColor: CORAL,
        borderWidth: 2,
        pointRadius: 4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 22, right: 16, left: 8 } },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.y}th percentile` } },
      datalabels: valueLabels({
        anchor: 'end',
        offset: 6,
        align(ctx) {
          const n = ctx.dataset.data.length;
          if (ctx.dataIndex === 0) return 25;
          if (ctx.dataIndex === n - 1) return 155;
          return 'top';
        },
        display(ctx) {
          return ctx.dataset.data[ctx.dataIndex] != null && !ctx.dataset.hidden;
        },
        formatter(value) {
          return value && value.y != null ? fmtNum(value.y) : null;
        },
      }),
    },
    scales: {
      x: {
        type: 'linear',
        offset: true,
        ticks: { color: MUTED, stepSize: 2, padding: 4 },
        grid: { display: false },
      },
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Percentile (higher = better)',
          color: MUTED,
          font: { family: "'IBM Plex Sans'", size: 12 },
        },
        grid: { color: HAIR },
        ticks: { color: MUTED, padding: 6 },
      },
    },
  },
});

function updatePercentile() {
  percentileChart.getDatasetMeta(0).hidden = !show('open');
  percentileChart.getDatasetMeta(1).hidden = !show('women');
  percentileChart.update();
  const pctInsights = {
    all: "On this measure the story is cleaner than raw rank suggested: Open climbs fairly steadily from the 19th percentile (2004) to the 55th (2022), finishing in the top half of the field for the first time. Women's section is more volatile: 16th percentile in the 2014 debut, up to 43rd by 2022.",
    open: 'Open climbs fairly steadily from the 19th percentile (2004) to the 55th (2022), finishing in the top half of the field for the first time.',
    women:
      "Women's percentile is more volatile: 16th in the 2014 debut, then 21st (2016), 23rd (2018), and 43rd by 2022.",
  };
  document.getElementById('percentile-insight').textContent = pctInsights[sectionFilter];
}

// ---- repeat player appearances ----
const capsRows = [
  {
    name: 'Shrestha Keshav',
    count: 6,
    years: [2004, 2006, 2010, 2012, 2014, 2016],
    sections: ['open'],
    title: 'CM',
  },
  {
    name: 'Shrestha Bilam Lal',
    count: 4,
    years: [2004, 2006, 2010, 2016],
    sections: ['open'],
    title: 'FM',
  },
  {
    name: 'Jaiswal Rupesh',
    count: 4,
    years: [2012, 2018, 2022, 2026],
    sections: ['open'],
    title: 'FM',
  },
  { name: 'Hamal Manish', count: 3, years: [2008, 2012, 2014], sections: ['open'], title: 'FM' },
  {
    name: 'Khamboo Monalisha',
    count: 3,
    years: [2014, 2016, 2018],
    sections: ['women'],
    title: 'WCM',
  },
  { name: 'Joshi Sindira', count: 3, years: [2016, 2018, 2026], sections: ['women'], title: null },
  { name: 'Lohani Sujana', count: 3, years: [2016, 2018, 2022], sections: ['women'], title: 'WFM' },
  { name: 'Malla Digesh Shanker', count: 2, years: [2004, 2006], sections: ['open'], title: null },
  {
    name: 'Shrestha Rajendra Prasad',
    count: 2,
    years: [2004, 2006],
    sections: ['open'],
    title: null,
  },
  { name: 'Surbir Lama', count: 2, years: [2004, 2008], sections: ['open'], title: null },
  { name: 'Nepali Badrilal', count: 2, years: [2006, 2010], sections: ['open'], title: null },
  {
    name: 'Shrestha Sujendra Prasad',
    count: 2,
    years: [2008, 2014],
    sections: ['open'],
    title: 'FM',
  },
  { name: 'Malakar Prachanda Man', count: 2, years: [2010, 2012], sections: ['open'], title: 'CM' },
  { name: 'Maharjan Sajin', count: 2, years: [2014, 2016], sections: ['open'], title: 'CM' },
  { name: 'Rajbhandari Rijendra', count: 2, years: [2014, 2018], sections: ['open'], title: 'CM' },
  { name: 'Adhikari Ashmita', count: 2, years: [2014, 2016], sections: ['women'], title: null },
  { name: 'Bhandari Kshitiz', count: 2, years: [2016, 2022], sections: ['open'], title: 'FM' },
  { name: 'Thing Bibek', count: 2, years: [2018, 2022], sections: ['open'], title: 'CM' },
  { name: 'Adhikari Kritisara', count: 2, years: [2022, 2026], sections: ['women'], title: null },
];

let capsChart;
function renderCaps() {
  const rows = capsRows.filter((r) => {
    if (sectionFilter === 'all') return true;
    return r.sections.includes(sectionFilter);
  });
  const labels = rows.map((r) => (r.title ? `${r.title} ${r.name}` : r.name));
  const values = rows.map((r) => r.count);
  const colors = rows.map((r) =>
    r.sections.includes('women') && !r.sections.includes('open') ? CORAL : NAVY,
  );
  if (capsChart) capsChart.destroy();
  capsChart = new Chart(document.getElementById('capsChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderRadius: 3,
          barThickness: 14,
          categoryPercentage: 0.7,
          barPercentage: 0.78,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 28 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) =>
              `${rows[c.dataIndex].count} appearances: ${rows[c.dataIndex].years.join(', ')}`,
          },
        },
        datalabels: valueLabels({
          anchor: 'end',
          align: 'right',
          offset: 4,
        }),
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Number of Olympiad appearances',
            color: MUTED,
            font: { family: "'IBM Plex Sans'", size: 12 },
          },
          grid: { color: HAIR },
          ticks: { color: MUTED, stepSize: 1 },
        },
        y: { grid: { display: false }, ticks: { color: MUTED, font: { size: 11 } } },
      },
    },
  });
  const capsInsights = {
    all: "Keshav Shrestha still leads with 6, all played between 2004 and 2016. Shrestha Bilam Lal and Jaiswal Rupesh tie for second at 4, and Jaiswal's 4th only counts because the 2026 squad is included, his run would otherwise stop at 2022. Khamboo Monalisha, Joshi Sindira and Lohani Sujana share the top of the Women's section at 3 each.",
    open: "Keshav Shrestha leads Open with 6 appearances (2004\u20132016). Shrestha Bilam Lal and Jaiswal Rupesh tie at 4; Jaiswal's 4th counts the 2026 provisional squad.",
    women:
      "Khamboo Monalisha, Joshi Sindira and Lohani Sujana share the top of the Women's section at 3 appearances each.",
  };
  document.getElementById('caps-insight').textContent = capsInsights[sectionFilter];
}

// ---- comparison table ----
function renderComp() {
  const all = [
    { label: 'Open', cls: 'row-open', section: 'open', d: comparison.open },
    { label: 'Women', cls: 'row-women', section: 'women', d: comparison.women },
  ].filter((r) => show(r.section));
  document.getElementById('compTable').innerHTML = all
    .map(
      (r) =>
        `<tr class="${r.cls}"><td>${r.label}</td><td class="num">${r.d.editions_competed}</td><td class="num">${r.d.avg_age}</td><td class="num">${r.d.avg_rating}</td><td class="num">${r.d.best_rank}th</td><td class="num">${r.d.avg_rank}</td></tr>`,
    )
    .join('');
}

function updateLegends() {
  document.querySelectorAll('[data-pair-legend] .legend-item[data-section]').forEach((el) => {
    el.classList.toggle('is-hidden', !show(el.dataset.section));
  });
}

function applySectionFilter() {
  renderScoreboard();
  updateTrend();
  updateContinuityPanels();
  renderExtremes();
  renderSeed();
  updateField();
  updatePercentile();
  renderCaps();
  renderComp();
  updateLegends();
}

document.getElementById('sectionFilter').addEventListener('change', (e) => {
  sectionFilter = e.target.value;
  applySectionFilter();
});

// ---- scroll reveal + reduced-motion chart defaults ----
const preferReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (preferReduced) {
  Chart.defaults.animation = false;
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}
if (preferReduced) {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
}

// ---- footer notes ----
document.getElementById('footer').innerHTML += `
  <p>Ages are computed from FIDE birth year only, no month or day on record, so treat age at event as \u00b11 year.</p>
  <p>One genuinely unrated debutant (Bijendra Maharjan, 2004) is excluded from the performance chart since a rating of zero makes the gap meaningless.</p>
  <p>One known open item: the FIDE database holds two profiles for Prachand Man Malakar (12300985 and 12306576), likely the same person under two IDs. Not merged here.</p>
`;

applySectionFilter();
