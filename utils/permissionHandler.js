const fs = require('fs');
const path = './data/permissions.json';

let permissions = {};
if (fs.existsSync(path)) {
  permissions = JSON.parse(fs.readFileSync(path, 'utf-8'));
  console.log('✅ Permissions loaded');
} else {
  console.log('⚠️ permissions.json not found, starting empty');
}

function savePermissions() {
  fs.writeFileSync(path, JSON.stringify(permissions, null, 2));
}

function isAllowed(userId, commandName, memberRoles = []) {
  const commandPerms = permissions[commandName];
  if (!commandPerms) return false;

  const allowedUsers = commandPerms.users || [];
  const allowedRoles = commandPerms.roles || [];

  if (allowedUsers.includes(userId)) return true;
  return memberRoles.some(roleId => allowedRoles.includes(roleId));
}

function updatePermissions(commandName, type, id, action) {
  if (!permissions[commandName]) {
    permissions[commandName] = { users: [], roles: [] };
  }

  const list = permissions[commandName][type];
  if (!list) return;

  if (action === 'add' && !list.includes(id)) list.push(id);
  if (action === 'remove') permissions[commandName][type] = list.filter(i => i !== id);

  savePermissions();
}

module.exports = { isAllowed, updatePermissions };
