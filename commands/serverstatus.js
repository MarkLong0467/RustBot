const { SlashCommandBuilder } = require('discord.js');
const Gamedig = require('gamedig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstatus')
    .setDescription('Check status of an Atlas Rust server')
    .addStringOption(option =>
      option.setName('server')
        .setDescription('Choose a server or type an IP:Port')
        .setRequired(true)
        .addChoices(
          { name: '10x', value: '10x.atlasrust.us' },
          { name: '5x', value: '5x.atlasrust.us' },
          { name: 'Large', value: 'large.atlasrust.us' },
          { name: 'Other', value: 'custom' }
        )
    )
    .addStringOption(option =>
      option.setName('ip')
        .setDescription('Optional: IP:Port if "Other" selected')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const serverChoice = interaction.options.getString('server');
    const customIP = interaction.options.getString('ip');
    let target = serverChoice === 'custom' ? customIP : serverChoice;

    if (!target) {
      return interaction.editReply({ content: '❌ No server selected or IP missing.' });
    }

    // Default port 28015 if not included
    if (!target.includes(':')) {
      target += ':28015';
    }

    const [host, port] = target.replace(/^connect\s+/, '').split(':');

    try {
      const data = await Gamedig.query({
        type: 'rust',
        host,
        port: parseInt(port),
      });

      const embed = {
        title: `🟢 ${data.name}`,
        color: 0x00ff00,
        fields: [
          { name: 'Players', value: `${data.raw.numplayers}/${data.maxplayers}`, inline: true },
          { name: 'Map', value: data.map || 'Unknown', inline: true },
          { name: 'IP', value: `${host}:${port}`, inline: true }
        ],
        footer: { text: `Server status fetched at ${new Date().toLocaleTimeString()}` }
      };

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: '🔴 Server offline or unreachable.' });
    }
  }
};
