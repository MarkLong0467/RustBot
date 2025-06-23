require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const { loadPermissions } = require('./utils/permissionHandler');
const { enqueueRequest, processQueue } = require('./utils/requestQueue');
const { loadCommands } = require('./utils/loadCommands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
const commands = loadCommands();
commands.forEach(command => {
  client.commands.set(command.data.name, command);
  const options = command.data.options ?? [];
  if (Array.isArray(options)) {
    console.log(`✅ Loaded: /${command.data.name} with options: ${options.map(o => o.name).join(', ')}`);
  } else {
    console.log(`✅ Loaded: /${command.data.name} with no options`);
  }
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  processQueue(); // Start rate-limited queue
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('❌ Command Error:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Something went wrong.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
