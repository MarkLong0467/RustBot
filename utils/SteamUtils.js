const axios = require('axios');

const cache = new Map(); // steamId => { data, timestamp }
const queue = [];
let isProcessing = false;

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  while (queue.length > 0) {
    const { steamId, resolve, reject } = queue.shift();

    try {
      const now = Date.now();
      const cached = cache.get(steamId);
      if (cached && now - cached.timestamp < 30000) {
        resolve(cached.data);
      } else {
        const res = await axios.get(
          'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/',
          {
            params: {
              key: process.env.STEAM_API_KEY,
              steamids: steamId
            },
            headers: {
              'User-Agent': 'RustBot/1.0'
            }
          }
        );

        const player = res.data?.response?.players?.[0];
        if (player) {
          cache.set(steamId, { data: player, timestamp: now });
          resolve(player);
        } else {
          reject(new Error('No player data found'));
        }
      }
    } catch (err) {
      reject(err);
    }

    await delay(1100); // Wait before next
  }

  isProcessing = false;
}

function getSteamData(steamId) {
  return new Promise((resolve, reject) => {
    queue.push({ steamId, resolve, reject });
    processQueue();
  });
}

module.exports = { getSteamData };
