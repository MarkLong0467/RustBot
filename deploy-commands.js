require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check if a Rust/Atlas player is online')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Player name to search')
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('📡 Deploying slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Commands deployed!');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
})();
