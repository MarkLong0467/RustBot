// utils/battleMetricsUtils.js
const axios = require('axios');

async function getBattleMetricsData(steamId) {
  const token = process.env.BATTLEMETRICS_TOKEN;
  const url = `https://api.battlemetrics.com/players?filter[search]=${steamId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('BattleMetrics API Error:', error);
    return null;
  }
}

module.exports = {
  getBattleMetricsData,
};