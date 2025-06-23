// utils/SteamUtils.js
const axios = require('axios');

async function getSteamProfile(input) {
  const apiKey = process.env.STEAM_API_KEY;
  let steam64 = input;

  // Check if input is a custom URL or vanity name
  if (isNaN(input)) {
    try {
      const resolve = await axios.get(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${input}`);
      if (resolve.data.response.success !== 1) return null;
      steam64 = resolve.data.response.steamid;
    } catch (err) {
      console.error('Vanity URL lookup failed:', err);
      return null;
    }
  }

  try {
    const profile = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steam64}`);
    const user = profile.data.response.players[0];
    return user || null;
  } catch (err) {
    console.error('Steam profile fetch failed:', err);
    return null;
  }
}

module.exports = {
  getSteamProfile,
};
