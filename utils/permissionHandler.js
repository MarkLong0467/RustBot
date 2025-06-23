const fs = require('fs');
const path = './permissions.json';

function loadPermissions() {
  if (!fs.existsSync(path)) return {};
  return JSON.parse(fs.readFileSync(path));
}

function isAllowed(userId, command) {
  const data = loadPermissions();
  return data.users?.[userId]?.includes(command) || false;
}

module.exports = { isAllowed };
