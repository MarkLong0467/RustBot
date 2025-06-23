const { SlashCommandBuilder } = require('discord.js');
const { validateSteamInput } = require('../utils/steamUtils');
const { isTrackingConfigured, removePlayerFromTrack } = require('../utils/trackStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trackremove')
    .setDescription('Remove a player from the tracking list')
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

    removePlayerFromTrack(channelId, steamID64);
    interaction.reply({ content: `✅ Removed SteamID: ${steamID64} from tracking.` });
  }
};
