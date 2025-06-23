const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getSteamData } = require('../utils/SteamUtils');
const { getBattleMetricsData } = require('../utils/battleMetricsUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check a Steam user\'s info')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Steam URL or ID')
        .setRequired(true)
    ),

  async execute(interaction) {
    const input = interaction.options.getString('name');
    console.log(`🔍 /check triggered with input: ${input}`);
    await interaction.deferReply({ ephemeral: true });

    try {
      const steamInfo = await getSteamData(input);
      const battleInfo = await getBattleMetricsData(input);

      console.log('✅ Steam Info:', steamInfo);
      console.log('✅ BattleMetrics Info:', battleInfo);

      if (!steamInfo && !battleInfo) {
        return interaction.editReply({ content: '❌ No data found for that user.' });
      }

      const embed = new EmbedBuilder()
        .setTitle('User Info')
        .setColor(0x00AE86)
        .setTimestamp();

      if (steamInfo) {
        embed.addFields(
          { name: 'Steam Name', value: steamInfo.personaname || 'N/A', inline: true },
          { name: 'Steam ID', value: steamInfo.steamid || 'N/A', inline: true },
          { name: 'Profile', value: steamInfo.profileurl || 'N/A' }
        );
        if (steamInfo.avatarfull) embed.setThumbnail(steamInfo.avatarfull);
      }

      if (battleInfo) {
        embed.addFields(
          { name: 'BattleMetrics Name', value: battleInfo.name || 'N/A', inline: true },
          { name: 'Server', value: battleInfo.server || 'N/A', inline: true },
          { name: 'Last Seen', value: battleInfo.lastSeen || 'N/A', inline: true }
        );
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('❌ Error in /check:', error);
      await interaction.editReply({ content: '❌ Error while fetching data.' });
    }
  }
};
