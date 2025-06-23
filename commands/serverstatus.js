const { SlashCommandBuilder } = require('discord.js');
const Gamedig = require('gamedig').default;
module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstatus')
    .setDescription('Check the status of an Atlas server.')
    .addStringOption(option =>
      option.setName('server')
        .setDescription('Select a preset Atlas server or choose "Other"')
        .setRequired(true)
        .addChoices(
          { name: '10x', value: '10x.atlasrust.us:28015' },
          { name: '5x', value: '5x.atlasrust.us:28015' },
          { name: '2x', value: '2x.atlasrust.us:28015' },
          { name: 'Large', value: 'large.atlasrust.us:28015' },
          { name: 'Small', value: 'small.atlasrust.us:28015' },
          { name: 'Other', value: 'custom' }
        )
    )
    .addStringOption(option =>
      option.setName('ip')
        .setDescription('Optional IP:PORT for custom servers (if "Other" selected)')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const selected = interaction.options.getString('server');
    const customInput = interaction.options.getString('ip');

    let target = selected;
    if (selected === 'custom') {
      if (!customInput || !customInput.includes(':')) {
        return interaction.editReply('❌ Invalid IP or missing port (use IP:PORT format).');
      }
      target = customInput;
    }

    const [host, port] = target.split(':');
    console.log(`Querying ${host}:${port}`);

    try {
      const state = await Gamedig.query({
        type: 'atlas',
        host,
        port: parseInt(port)
      });

      const embed = {
        title: `🟢 Server Online: ${state.name}`,
        color: 0x57F287,
        fields: [
          { name: 'IP', value: `${host}:${port}`, inline: true },
          { name: 'Players', value: `${state.players.length}/${state.maxplayers}`, inline: true },
          { name: 'Map', value: state.map || 'Unknown', inline: true }
        ],
        footer: { text: `Server Status • Atlas Rust` },
        timestamp: new Date().toISOString()
      };

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('🔴 Server offline or unreachable.');
    }
  }
};
