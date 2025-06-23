const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { saveTrackingConfig, isTrackingConfigured } = require('../utils/trackStorage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('track')
    .setDescription('Start tracking player online status in this channel')
    .addStringOption(opt =>
      opt.setName('interval')
        .setDescription('Update interval')
        .setRequired(true)
        .addChoices(
          { name: '5s', value: '5' },
          { name: '15s', value: '15' },
          { name: '30s', value: '30' },
          { name: '1m', value: '60' },
          { name: '5m', value: '300' }
        )
    )
    .addRoleOption(opt =>
      opt.setName('pingrole')
        .setDescription('Ping this role if all tracked users go offline')
        .setRequired(false)
    ),

  async execute(interaction) {
    const interval = parseInt(interaction.options.getString('interval'));
    const pingRole = interaction.options.getRole('pingrole');
    const channelId = interaction.channel.id;

    if (isTrackingConfigured(channelId)) {
      return interaction.reply({ content: '❌ This channel already has a tracking embed.', ephemeral: true });
    }

    const embed = {
      title: '🎯 Player Tracker',
      description: 'Use `/trackadd` to start tracking players.\n\n**Tracking will update every `' + interval + 's`.**',
      color: 0x3498db,
      fields: [],
      footer: { text: 'Last updated: Just now' }
    };

    const message = await interaction.channel.send({ embeds: [embed] });
    saveTrackingConfig(channelId, {
      messageId: message.id,
      interval,
      pingRole: pingRole ? pingRole.id : null,
      players: []
    });

    interaction.reply({ content: `✅ Tracking started. Use \`/trackadd\` to add players.`, ephemeral: true });
  }
};
