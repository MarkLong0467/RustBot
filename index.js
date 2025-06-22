require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'check') {
    const query = interaction.options.getString('name');
    const url = `https://api.battlemetrics.com/players?filter[search]=${encodeURIComponent(query)}`;
    const steamAPIKey = process.env.STEAM_API_KEY;

    await interaction.deferReply();

    try {
      // === BattleMetrics ===
      const bmRes = await fetch(url);
      const bmData = await bmRes.json();

      let bmText = '❌ No BattleMetrics match found.';
      if (bmData.data.length > 0) {
        const player = bmData.data[0];
        const name = player.attributes.name || query;
        const online = player.attributes.online;
        const lastSeen = player.attributes.lastSeen;
        const serverID = player.relationships.server?.data?.id || 'None';
        const bmLink = `https://www.battlemetrics.com/rcon/players/${player.id}`;

        const lastSeenText = lastSeen
          ? `<t:${Math.floor(new Date(lastSeen).getTime() / 1000)}:R>`
          : `Unknown`;

        bmText = [
          `🎮 BM Name: **${name}**`,
          `🔗 BM Link: ${bmLink}`,
          `🔎 BM Status: **${online ? '🟢 Online' : '🔴 Offline'}**`,
          online ? `📌 Server ID: \`${serverID}\`` : `🕓 Last Seen: ${lastSeenText}`
        ].join('\n');
      }

      // === Steam (if numeric 64-bit ID) ===
      let steamText = 'ℹ️ Steam check skipped.';
      const steamID64 = query.match(/^7656\d{13}$/) ? query : null;
      if (steamID64 && steamAPIKey) {
        const steamRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamAPIKey}&steamids=${steamID64}`);
        const steamJson = await steamRes.json();
        const playerInfo = steamJson.response.players[0];

        if (playerInfo) {
          const persona = playerInfo.personaname;
          const status = [
            'Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to Trade', 'Looking to Play'
          ][playerInfo.personastate] || 'Unknown';

          steamText = [
            `👤 Steam Name: **${persona}**`,
            `🌐 Steam Profile: ${playerInfo.profileurl}`,
            `💡 Steam Status: **${status}**`
          ].join('\n');
        } else {
          steamText = `❌ Steam ID not found.`;
        }
      }

      interaction.editReply({ content: `${bmText}\n\n${steamText}` });

    } catch (err) {
      console.error(err);
      interaction.editReply(`⚠️ API Error`);
    }
  }
});

client.login(process.env.TOKEN);
