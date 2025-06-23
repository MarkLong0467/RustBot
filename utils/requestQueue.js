const axios = require('axios');
const fs = require('fs');

const queue = [];
const cache = {};
const CACHE_TIME = 10 * 1000; // 10 sec

async function requestWithLimit(key, url) {
  const now = Date.now();

  if (cache[key] && now - cache[key].time < CACHE_TIME) {
    return cache[key].data;
  }

  return new Promise((resolve, reject) => {
    queue.push({ key, url, resolve, reject });
  });
}

async function processQueue() {
  if (queue.length === 0) return;

  const { key, url, resolve, reject } = queue.shift();

  try {
    const res = await axios.get(url, { timeout: 5000 });
    cache[key] = { data: res.data, time: Date.now() };
    resolve(res.data);
  } catch (err) {
    reject(err);
  }

  setTimeout(processQueue, 1000); // 1 req/sec
}

setTimeout(processQueue, 1000); // start processing after 1 sec

module.exports = { requestWithLimit, processQueue };
