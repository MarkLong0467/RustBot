const axios = require('axios');
require('dotenv').config();

async function getBattleMetricsData(input) {
  const token = process.env.BATTLEMETRICS_API_KEY;
  const headers = { Authorization: `Bearer ${token}` };

  const id = input.replace(/\D/g, ''); // Strip non-numeric
  const url = `https://api.battlemetrics.com/players?filter[search]=${id}`;

  try {
    const res = await axios.get(url, { headers });
    const player = res.data.data[0];

    if (!player) return null;

    return {
      name: player.attributes.name || 'N/A',
      lastSeen: player.attributes.lastSeen || 'N/A',
      server: player.relationships?.server?.data?.id || 'Unknown'
    };
  } catch (err) {
    console.error('❌ BattleMetrics API error:', err.response?.data || err.message);
    return null;
  }
}

module.exports = { getBattleMetricsData };
