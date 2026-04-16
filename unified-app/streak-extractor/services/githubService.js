const axios = require('axios');
const { calcStreak, calcActiveDays, calcWeeklyTotal } = require('../utils/metricsEngine');

const fetchMetrics = async (username) => {
  const headers = {};
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const { data: events } = await axios.get(
    `https://api.github.com/users/${username}/events`,
    { headers }
  );

  const dailyCommits = buildDailyMap(events);
  const todayKey = new Date().toISOString().slice(0, 10);

  return {
    today_commits: dailyCommits[todayKey] || 0,
    weekly_commits: calcWeeklyTotal(dailyCommits),
    active_days: calcActiveDays(dailyCommits, 7),
    streak: calcStreak(dailyCommits),
  };
};

const buildDailyMap = (events) => {
  const map = {};
  events.forEach((event) => {
    if (event.type !== 'PushEvent') return;
    const date = event.created_at.slice(0, 10);
    const count = event.payload?.commits?.length || 0;
    map[date] = (map[date] || 0) + count;
  });
  return map;
};

module.exports = { fetchMetrics };
