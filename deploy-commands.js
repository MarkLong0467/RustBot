require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const commandList = ['check', 'permissions', 'track', 'trackadd', 'trackremove']; // Add all your commands
const rest = new REST().setToken(process.env.TOKEN);
const commands = [
  new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check if a Rust/Atlas player is online')
    .addStringOption(option =>
      option.setName('name').setDescription('Player name or Steam ID/URL').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('Manage bot permissions')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add permission')
        .addStringOption(o =>
          o.setName('type')
            .setDescription('user or role')
            .setRequired(true)
            .addChoices(
              { name: 'user', value: 'user' },
              { name: 'role', value: 'role' }
            )
        )
        .addStringOption(o =>
          o.setName('id')
            .setDescription('Discord ID')
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName('command')
            .setDescription('Command to allow')
            .setRequired(true)
            .addChoices(
              ...commandList.map(cmd => ({ name: cmd, value: cmd }))
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove permission')
        .addStringOption(o =>
          o.setName('type')
            .setDescription('user or role')
            .setRequired(true)
            .addChoices(
              { name: 'user', value: 'user' },
              { name: 'role', value: 'role' }
            )
        )
        .addStringOption(o =>
          o.setName('id')
            .setDescription('Discord ID')
            .setRequired(true)
        )
    ),

  new SlashCommandBuilder()
    .setName('track')
    .setDescription('Create a tracking embed in this channel')
    .addIntegerOption(option =>
      option.setName('interval')
        .setDescription('How often to check users')
        .addChoices(
          { name: '5s', value: 5 },
          { name: '15s', value: 15 },
          { name: '30s', value: 30 },
          { name: '1m', value: 60 },
          { name: '5m', value: 300 }
        )
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('pingrole')
        .setDescription('Optional role to ping when all are offline')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('trackadd')
    .setDescription('Add a user to track')
    .addStringOption(option =>
      option.setName('steamid')
        .setDescription('SteamID or URL')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('trackremove')
    .setDescription('Remove a tracked user')
    .addStringOption(option =>
      option.setName('steamid')
        .setDescription('SteamID or URL')
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
  .then(() => console.log('✅ Commands deployed!'))
  .catch(console.error);