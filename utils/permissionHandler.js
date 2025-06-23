const fs = require('fs');
const path = './permissions.json';

let permissions = {};

function loadPermissions() {
  if (fs.existsSync(path)) {
    permissions = JSON.parse(fs.readFileSync(path));
    console.log('✅ Permissions loaded');
  } else {
    permissions = {};
    console.warn('⚠️ permissions.json not found, starting empty');
  }
}

function savePermissions() {
  fs.writeFileSync(path, JSON.stringify(permissions, null, 2));
}

function getPermissions() {
  return permissions;
}

function updatePermissions(command, type, id, add) {
  if (!['user', 'role', 'all'].includes(type)) return false;
  if (!permissions[command]) {
    permissions[command] = { users: [], roles: [] };
  }

  if (type === 'all') {
    permissions[command].users = [];
    permissions[command].roles = [];
    savePermissions();
    return true;
  }

  const list = type === 'user' ? permissions[command].users : permissions[command].roles;

  if (add && !list.includes(id)) {
    list.push(id);
  } else if (!add && list.includes(id)) {
    const i = list.indexOf(id);
    list.splice(i, 1);
  } else if (!add && !list.includes(id)) {
    return false;
  }

  savePermissions();
  return true;
}

function isAllowed(userId, command, member) {
  const cmdPerms = permissions[command];
  if (!cmdPerms) return false;

  if (cmdPerms.users.includes(userId)) return true;
  return member.roles.cache.some(role => cmdPerms.roles.includes(role.id));
}

module.exports = {
  loadPermissions,
  savePermissions,
  updatePermissions,
  getPermissions,
  isAllowed
};
