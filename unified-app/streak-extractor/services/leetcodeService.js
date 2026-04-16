const axios = require('axios');
const { calcStreak, calcWeeklyTotal } = require('../utils/metricsEngine');

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

const fetchMetrics = async (username) => {
  const query = `
    query userProfileCalendar($username: String!) {
      matchedUser(username: $username) {
        userCalendar {
          submissionCalendar
        }
      }
    }
  `;

  const { data } = await axios.post(
    LEETCODE_GRAPHQL,
    { query, variables: { username } },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const rawCalendar = data?.data?.matchedUser?.userCalendar?.submissionCalendar;
  const calendar = JSON.parse(rawCalendar || '{}');

  const dailyMap = {};
  Object.entries(calendar).forEach(([ts, count]) => {
    const date = new Date(Number(ts) * 1000).toISOString().slice(0, 10);
    dailyMap[date] = (dailyMap[date] || 0) + count;
  });

  const todayKey = new Date().toISOString().slice(0, 10);

  return {
    today_solved: dailyMap[todayKey] || 0,
    weekly_solved: calcWeeklyTotal(dailyMap),
    streak: calcStreak(dailyMap),
  };
};

module.exports = { fetchMetrics };
