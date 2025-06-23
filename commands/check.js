const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getSteamData, getBattleMetricsData } = require('../utils/steamUtils');
const { isAllowed } = require('../utils/permissionHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check if a Rust/Atlas player is online')
    .addStringOption(opt =>
      opt.setName('name')
        .setDescription('SteamID, Custom URL, or full profile URL')
        .setRequired(true)
    ),
  async execute(interaction) {
    const userId = interaction.user.id;
    if (!isAllowed(userId, 'check')) {
      return interaction.reply({ content: '❌ You are not allowed to use this command.', ephemeral: true });
    }

    const input = interaction.options.getString('name');
    await interaction.deferReply();

    try {
      const steamData = await getSteamData(input);
      const bmData = await getBattleMetricsData(steamData.steamid);

      const embed = new EmbedBuilder()
        .setTitle(`🔍 Steam Profile: ${steamData.personaname}`)
        .setURL(steamData.profileurl)
        .setThumbnail(steamData.avatarfull)
        .addFields(
          { name: 'SteamID', value: steamData.steamid, inline: true },
          { name: 'Status', value: steamData.personastate.toString(), inline: true },
          { name: 'Steam Created', value: `<t:${steamData.timecreated}:F>`, inline: true },
          { name: 'Country', value: steamData.loccountrycode || 'Unknown', inline: true },
          { name: 'State', value: steamData.locstatecode || 'N/A', inline: true },
          { name: 'BattleMetrics ID', value: bmData.id || 'N/A', inline: true },
          { name: 'Current Server', value: bmData.serverName || 'Offline', inline: false }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('❌ Error:', err);
      await interaction.editReply({ content: '❌ Failed to fetch user info. Try again later.' });
    }
  }
};
