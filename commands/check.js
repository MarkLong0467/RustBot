// commands/check.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBattleMetricsData } = require('../utils/battleMetricsUtils');
const { getSteamProfile } = require('../utils/SteamUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check Steam & BattleMetrics info')
    .addStringOption(option =>
      option.setName('steamid')
        .setDescription('Steam64 ID or Custom URL')
        .setRequired(true)
    ),

  async execute(interaction) {
    const raw = interaction.options.getString('steamid');
    const input = raw?.trim();

    if (!input) {
      return interaction.reply({ content: '❌ Invalid Steam ID or URL.', ephemeral: true });
    }

    await interaction.deferReply();

    // Get Steam info
    const steam = await getSteamProfile(input);
    if (!steam || !steam.steamid) {
      return interaction.editReply('❌ Failed to fetch Steam profile.');
    }

    // Get BattleMetrics info using the Steam64 ID
    const battle = await getBattleMetricsData(steam.steamid);

    // Create Embed
    const embed = new EmbedBuilder()
      .setTitle(`${steam.personaname}`)
      .setURL(steam.profileurl)
      .setThumbnail(steam.avatarfull)
      .setColor(0x0099ff)
      .addFields(
        { name: 'Steam ID', value: steam.steamid, inline: true },
        { name: 'Account Created', value: steam.timecreated ? `<t:${steam.timecreated}:F>` : 'N/A', inline: true },
        { name: 'Status', value: steam.personastate.toString(), inline: true },
        { name: 'Profile Visibility', value: steam.communityvisibilitystate === 3 ? 'Public' : 'Private', inline: true },
        { name: 'Country', value: steam.loccountrycode || 'N/A', inline: true },
      );

    // Add BattleMetrics data if available
    if (battle && battle.data && battle.data.length > 0) {
      const bm = battle.data[0];
      const attr = bm.attributes;

      embed.addFields(
        { name: 'BattleMetrics ID', value: bm.id, inline: true },
        { name: 'BM Name', value: attr.name || 'Unknown', inline: true },
        { name: 'Last Seen', value: attr.lastSeen || 'N/A', inline: true },
        { name: 'Time Played', value: attr.timePlayed ? `${(attr.timePlayed / 3600).toFixed(2)} hrs` : 'N/A', inline: true }
      );
    } else {
      embed.addFields({ name: 'BattleMetrics', value: 'No data found.', inline: false });
    }

    embed.setTimestamp();
    interaction.editReply({ embeds: [embed] });
  },
};
