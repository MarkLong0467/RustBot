const { SlashCommandBuilder } = require('discord.js');
const { getSteamData, getBattleMetricsData } = require('../utils/SteamUtils');
const { isAllowed } = require('../utils/permissionHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Get Steam and BattleMetrics info')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Steam URL, name, or ID')
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getString('name');

    const allowed = isAllowed(interaction.user.id, 'check', interaction.member);
    if (!allowed) {
      return interaction.reply({ content: '❌ Not allowed to use this command.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: false });

    let steamInfo = '';
    let bmInfo = '';

    try {
      steamInfo = await getSteamData(target);
    } catch (err) {
      console.error('Steam error:', err);
      steamInfo = '❌ Failed to get Steam data.';
    }

    try {
      bmInfo = await getBattleMetricsData(target);
    } catch (err) {
      console.error('BattleMetrics error:', err);
      bmInfo = '❌ Failed to get BattleMetrics data.';
    }

    const embed = {
      color: 0x00b0f4,
      title: '✅ Info',
      description: `${steamInfo}\n\n${bmInfo}`,
      timestamp: new Date().toISOString(),
    };

    await interaction.editReply({ embeds: [embed] });
  }
};
