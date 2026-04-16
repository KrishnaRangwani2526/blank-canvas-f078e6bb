// Extract username from profile URL
// e.g. 'https://github.com/johndoe' -> 'johndoe'
const extractUsername = (url, domain) => {
  if (!url) throw new Error(`Missing URL for domain: ${domain}`);
  const parts = url.replace(/\/$/, '').split('/');
  return parts[parts.length - 1];
};

// Sum activity for last 7 days
const calcWeeklyTotal = (dailyMap) => {
  let total = 0;
  for (let i = 0; i < 7; i++) {
    total += dailyMap[offsetDate(i)] || 0;
  }
  return total;
};

// Count days with >= 1 activity in last N days
const calcActiveDays = (dailyMap, n = 7) => {
  let active = 0;
  for (let i = 0; i < n; i++) {
    if ((dailyMap[offsetDate(i)] || 0) > 0) active++;
  }
  return active;
};

// Count consecutive days with activity going backwards from today
const calcStreak = (dailyMap) => {
  let streak = 0;
  let i = 0;
  while (true) {
    const date = offsetDate(i);
    if ((dailyMap[date] || 0) > 0) {
      streak++;
      i++;
    } else if (i === 0) {
      i++; // no activity today — check from yesterday
    } else {
      break;
    }
  }
  return streak;
};

// Return 'YYYY-MM-DD' for daysAgo days before today
const offsetDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

module.exports = { extractUsername, calcWeeklyTotal, calcActiveDays, calcStreak, offsetDate };
