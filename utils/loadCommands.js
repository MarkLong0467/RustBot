const fs = require('fs');
const path = require('path');

function loadCommands() {
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  const commands = [];

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command);
    } else {
      console.warn(`⚠️ Skipped invalid command: ${file}`);
    }
  }

  return commands;
}

module.exports = { loadCommands };
