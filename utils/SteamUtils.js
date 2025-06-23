const axios = require('axios');

async function getSteamData(input) {
  const steamId = input.replace(/\D/g, '');
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`;
  const res = await axios.get(url);
  const player = res.data.response.players[0];
  if (!player) return 'No Steam data found.';

  return `**Steam Name:** ${player.personaname}
**Steam ID:** ${player.steamid}
**Profile:** ${player.profileurl}
**Status:** ${getStatus(player.personastate)}
**Game:** ${player.gameextrainfo || 'N/A'}
**Country:** ${player.loccountrycode || 'Unknown'}
**Avatar:** ${player.avatarfull}`;
}

function getStatus(state) {
  const states = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to Trade', 'Looking to Play'];
  return states[state] || 'Unknown';
}

async function getBattleMetricsData(input) {
  const res = await axios.get(`https://api.battlemetrics.com/players?filter[search]=${input}`);
  const player = res.data?.data?.[0];
  if (!player) return 'No BattleMetrics data found.';
  const name = player.attributes.name;
  const id = player.id;
  const updated = player.attributes.updatedAt;
  const lastSeen = `<t:${Math.floor(new Date(updated).getTime() / 1000)}:R>`;
  return `**BM Name:** ${name}
**BM ID:** ${id}
**Last Seen:** ${lastSeen}`;
}

module.exports = {
getSteamData,
getBattleMetricsData
};
