// Kaggle has no reliable public API. Returns mock structure so the
// unified response shape stays intact. Add Cheerio scraping here later.

const fetchMetrics = async (username) => {
  return {
    weekly_activity: 0,
    last_active_days_ago: null,
    note: 'Kaggle integration pending — no public API available',
  };
};

module.exports = { fetchMetrics };
