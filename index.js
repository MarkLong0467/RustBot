require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel]
});

client.commands = new Collection();

// Load all command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

// Load button interaction handler
const interactionHandler = require('./events/interactionCreate');

// Handle ALL interactions
client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
    } else if (interaction.isButton()) {
      await interactionHandler.execute(interaction); // Safely defer handled in file
    }
  } catch (err) {
    console.error('❌ Error in interactionCreate:', err);
    if (!interaction.replied) {
      await interaction.reply({ content: '❌ Error occurred.', ephemeral: true });
    }
  }
});