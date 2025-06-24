const fs = require('fs');
const path = require('path');

const permPath = path.join(__dirname, '../data/permissions.json');
if (!fs.existsSync(permPath)) fs.writeFileSync(permPath, JSON.stringify({}));

function hasPermission(userId, command) {
  const perms = JSON.parse(fs.readFileSync(permPath));
  return perms[userId]?.includes(command) || userId === '1096566768421580912';
}

module.exports = { hasPermission };
