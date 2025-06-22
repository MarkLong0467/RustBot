// deploy-commands.js
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check if a Rust/Atlas player is online via BattleMetrics')
    .addStringOption(opt => opt.setName('name').setDescription('Player name').setRequired(true))
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
rest.put(Routes.applicationCommands('YOUR_CLIENT_ID'), { body: commands })
  .then(() => console.log('✅ Slash command registered.'))
  .catch(console.error);
