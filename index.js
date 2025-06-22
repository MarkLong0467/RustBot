require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const allowedUsers = ['1096566768421580912']; // Add user IDs
const allowedRoles = ['123456789012345678'];  // Add role IDs

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

function isAllowed(interaction) {
  if (allowedUsers.includes(interaction.user.id)) return true;
  if (interaction.member?.roles?.cache?.some(r => allowedRoles.includes(r.id))) return true;
  if (interaction.mentions?.users?.has(interaction.user.id)) return true;
  return false;
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'check') return;

  if (!isAllowed(interaction)) {
    return interaction.reply({ content: '❌ You’re not allowed to use this command.', ephemeral: true });
  }

  const query = interaction.options.getString('name');
  const steamAPIKey = process.env.STEAM_API_KEY;
  const bmURL = `https://api.battlemetrics.com/players?filter[search]=${encodeURIComponent(query)}`;

  await interaction.deferReply();

  try {
    // === BattleMetrics ===
    const bmRes = await fetch(bmURL);
    const bmData = await bmRes.json();

    let bmFields = [];
    let bmFound = false;

    if (bmData.data.length > 0) {
      const bmPlayer = bmData.data[0];
      bmFound = true;
      bmFields.push(
        { name: 'BM Name', value: bmPlayer.attributes.name || 'Unknown', inline: true },
        { name: 'Online', value: bmPlayer.attributes.online ? '🟢 Yes' : '🔴 No', inline: true },
        { name: 'Player ID', value: bmPlayer.id, inline: false },
      );

      if (bmPlayer.attributes.lastSeen) {
        const lastSeen = `<t:${Math.floor(new Date(bmPlayer.attributes.lastSeen).getTime() / 1000)}:R>`;
        bmFields.push({ name: 'Last Seen', value: lastSeen, inline: true });
      }

      if (bmPlayer.relationships?.server?.data?.id) {
        bmFields.push({ name: 'Server ID', value: bmPlayer.relationships.server.data.id, inline: true });
      }

      bmFields.push({ name: 'BattleMetrics Profile', value: `https://www.battlemetrics.com/rcon/players/${bmPlayer.id}`, inline: false });
    }

    // === Steam ===
    let steamEmbed = null;
    const steamID64 = query.match(/^7656\d{13}$/) ? query : null;

    if (steamID64 && steamAPIKey) {
      const steamRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamAPIKey}&steamids=${steamID64}`);
      const contentType = steamRes.headers.get('content-type');
      if (!steamRes.ok || !contentType?.includes('application/json')) throw new Error('Steam API invalid');

      const steamJson = await steamRes.json();
      const p = steamJson.response.players[0];
      if (p) {
        const status = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to Trade', 'Looking to Play'][p.personastate] || 'Unknown';
        const createdAt = p.timecreated ? `<t:${p.timecreated}:F>` : 'Unknown';
        const realName = p.realname || '—';
        const country = p.loccountrycode || '—';

        steamEmbed = new EmbedBuilder()
          .setTitle(`Steam Profile: ${p.personaname}`)
          .setURL(p.profileurl)
          .setThumbnail(p.avatarfull)
          .addFields(
            { name: 'Status', value: status, inline: true },
            { name: 'Real Name', value: realName, inline: true },
            { name: 'Country', value: country, inline: true },
            { name: 'Steam ID', value: steamID64, inline: false },
            { name: 'Joined', value: createdAt, inline: false }
          )
          .setColor(0x1b2838);
      }
    }

    // === Send Embed(s) ===
    const embeds = [];

    if (bmFound) {
      embeds.push(new EmbedBuilder()
        .setTitle(`BattleMetrics Info`)
        .addFields(...bmFields)
        .setColor(0xea580c));
    }

    if (steamEmbed) embeds.push(steamEmbed);
    if (!embeds.length) embeds.push(new EmbedBuilder().setDescription('❌ No info found.').setColor(0xff0000));

    await interaction.editReply({ embeds });

  } catch (err) {
    console.error(err);
    await interaction.editReply({ content: `⚠️ Error: ${err.message}` });
  }
});

client.login(process.env.TOKEN);
