const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../permissions.json');

let permissions = {};
if (fs.existsSync(file)) {
  permissions = JSON.parse(fs.readFileSync(file));
}

function getPermissions() {
  return permissions;
}

function isAllowed(userId, command, member) {
  const allowed = new Set([
    ...(permissions[command]?.users || []),
    ...(permissions['all']?.users || [])
  ]);

  const allowedRoles = new Set([
    ...(permissions[command]?.roles || []),
    ...(permissions['all']?.roles || [])
  ]);

  if (allowed.has(userId)) return true;
  if (member?.roles.cache.some(role => allowedRoles.has(role.id))) return true;

  return false;
}

function updatePermissions(command, type, id, add) {
  if (!permissions[command]) {
    permissions[command] = { users: [], roles: [] };
  }

  const list = permissions[command][type + 's'];
  const exists = list.includes(id);

  if (add && exists) return 'exists';
  if (!add && !exists) return 'not_found';

  if (add) list.push(id);
  else permissions[command][type + 's'] = list.filter(x => x !== id);

  fs.writeFileSync(file, JSON.stringify(permissions, null, 2));
  return add ? 'added' : 'removed';
}

module.exports = { getPermissions, isAllowed, updatePermissions };
