require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commandList = ['check', 'permissions']; // Add more commands as needed

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
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
  .then(() => console.log('✅ Commands deployed!'))
  .catch(console.error);
