const { SlashCommandBuilder } = require('discord.js');
const { getLookupData } = require('../utils/lookupCore');
const { hasPermission } = require('../utils/permissions');
const { cooldownCheck } = require('../utils/cooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lookup')
    .setDescription('Lookup a Rust player using Steam ID or URL')
    .addStringOption(opt =>
      opt.setName('input').setDescription('Steam ID, URL, or Vanity').setRequired(true))
    .addBooleanOption(opt =>
      opt.setName('hidden').setDescription('Hide the response (default false)')),

  async execute(interaction) {
    const userId = interaction.user.id;
    const input = interaction.options.getString('input');
    const hidden = interaction.options.getBoolean('hidden') || false;

    if (!await hasPermission(userId, 'lookup')) {
      return interaction.reply({ content: '❌ You do not have permission to use this.', ephemeral: true });
    }

    const cooldownPassed = cooldownCheck(input, userId);
    if (!cooldownPassed.allowed) {
      return interaction.reply({ content: cooldownPassed.message, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: hidden });

    try {
      const { embeds, components } = await getLookupData(input, userId);
      await interaction.editReply({ embeds, components });
    } catch (err) {
      console.error('Lookup Error:', err);
      await interaction.editReply({ content: '❌ Failed to fetch player data. Try again later.' });
    }
  }
};
