const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../data/track.json');

function load() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function save(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
