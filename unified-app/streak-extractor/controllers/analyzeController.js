const githubService = require('../services/githubService');
const leetcodeService = require('../services/leetcodeService');
const kaggleService = require('../services/kaggleService');
const { extractUsername } = require('../utils/metricsEngine');

const analyzeProfile = async (req, res) => {
  try {
    const { github_url, leetcode_url, kaggle_url } = req.body;

    const githubUser = extractUsername(github_url, 'github.com');
    const leetcodeUser = extractUsername(leetcode_url, 'leetcode.com');
    const kaggleUser = extractUsername(kaggle_url, 'kaggle.com');

    const [github, leetcode, kaggle] = await Promise.all([
      githubService.fetchMetrics(githubUser),
      leetcodeService.fetchMetrics(leetcodeUser),
      kaggleService.fetchMetrics(kaggleUser),
    ]);

    res.json({ success: true, data: { github, leetcode, kaggle } });
  } catch (err) {
    console.error('analyzeProfile error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { analyzeProfile };
