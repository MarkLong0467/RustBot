const { SlashCommandBuilder } = require('discord.js');
const { validateSteamInput } = require('../utils/steamUtils');
const { isTrackingConfigured, addPlayerToTrack } = require('../utils/trackStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trackadd')
    .setDescription('Add a player to the tracking list')
    .addStringOption(opt =>
      opt.setName('input')
        .setDescription('SteamID, custom URL or profile URL')
        .setRequired(true)
    ),

  async execute(interaction) {
    const input = interaction.options.getString('input');
    const channelId = interaction.channel.id;

    if (!isTrackingConfigured(channelId))
      return interaction.reply({ content: '❌ No tracker found in this channel.', ephemeral: true });

    const steamID64 = await validateSteamInput(input);
    if (!steamID64)
      return interaction.reply({ content: '❌ Invalid Steam input.', ephemeral: true });

    addPlayerToTrack(channelId, steamID64);
    interaction.reply({ content: `✅ Added SteamID: ${steamID64} to tracking.` });
  }
};
