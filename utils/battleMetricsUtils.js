const axios = require('axios');

async function getBattleMetricsPlayer(steamid) {
  const res = await axios.get(`https://api.battlemetrics.com/players?filter[search]=${steamid}`);
  const data = res.data.data[0];
  if (!data) return null;

  return {
    id: data.id,
    name: data.attributes.name,
    serverName: data.relationships.servers?.data?.[0]?.id || 'None'
  };
}

module.exports = { getBattleMetricsPlayer };
