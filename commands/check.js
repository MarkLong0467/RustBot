const { SlashCommandBuilder } = require('discord.js');
const { getSteamData, getBattleMetricsData, getRawSteamData } = require('../utils/SteamUtils');
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

    const steamInfoText = await getSteamData(target);
    const bmInfo = await getBattleMetricsData(target);
    const rawSteamData = await getRawSteamData(target);

    const embed = {
      color: 0x00b0f4,
      title: '✅ Info',
      description: `${steamInfoText}\n\n${bmInfo}`,
      thumbnail: {
        url: rawSteamData?.avatarfull || 'https://cdn.discordapp.com/embed/avatars/0.png'
      },
      timestamp: new Date().toISOString(),
    };

    await interaction.editReply({ embeds: [embed] });
  }
};
