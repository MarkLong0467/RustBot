const cooldowns = {};
const cacheTime = 5 * 60 * 1000;

function cooldownCheck(input, userId) {
  const now = Date.now();
  const key = input;

  if (!cooldowns[key]) cooldowns[key] = { time: 0, user: null };

  const timeDiff = now - cooldowns[key].time;
  if (timeDiff < cacheTime) {
    if (userId === '1096566768421580912') {
      return { allowed: true };
    }
    return {
      allowed: false,
      message: `⏱️ Please wait ${(cacheTime - timeDiff) / 1000 | 0}s before rechecking this profile.`
    };
  }

  cooldowns[key] = { time: now, user: userId };
  return { allowed: true };
}

module.exports = { cooldownCheck };
