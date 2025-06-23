const axios = require('axios');
const { getBattleMetricsPlayer } = require('./battleMetricsUtils');

async function getSteamData(input) {
  const steamId = extractSteamID(input);
  const res = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_KEY}&steamids=${steamId}`);
  const player = res.data.response.players[0];
  if (!player) throw new Error('Invalid Steam ID');
  return player;
}

function extractSteamID(input) {
  if (/\d{17}/.test(input)) return input.match(/\d{17}/)[0];
  if (input.includes('steamcommunity.com')) {
    const idMatch = input.match(/profiles\/(\d{17})/);
    if (idMatch) return idMatch[1];
  }
  throw new Error('Unable to extract Steam ID');
}

async function getBattleMetricsData(steamid) {
  const result = await getBattleMetricsPlayer(steamid);
  return result || {};
}

module.exports = { getSteamData, getBattleMetricsData };
