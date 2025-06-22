require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

let permissions = JSON.parse(fs.readFileSync('./permissions.json'));
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function hasPermission(userId, member, command) {
  if (permissions.users[userId]?.includes('*') || permissions.users[userId]?.includes(command)) return true;
  return member.roles.cache.some(role =>
    permissions.roles[role.id]?.includes('*') || permissions.roles[role.id]?.includes(command)
  );
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // === /check ===
  if (interaction.commandName === 'check') {
    if (!hasPermission(interaction.user.id, interaction.member, 'check')) {
      return interaction.reply({ content: '❌ You are not allowed to use this.', ephemeral: true });
    }

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
        const lastSeenText = lastSeen ? `<t:${Math.floor(new Date(lastSeen).getTime() / 1000)}:R>` : `Unknown`;

        bmText = [
          `🎮 BM Name: **${name}**`,
          `🔗 BM Link: ${bmLink}`,
          `🔎 BM Status: **${online ? '🟢 Online' : '🔴 Offline'}**`,
          online ? `📌 Server ID: \`${serverID}\`` : `🕓 Last Seen: ${lastSeenText}`
        ].join('\n');
      }

      // === Steam ===
      let steamText = 'ℹ️ Steam check skipped.';
      const steamID64 = query.match(/^7656\d{13}$/) ? query : null;
      if (steamID64 && steamAPIKey) {
        const steamRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamAPIKey}&steamids=${steamID64}`);
        const contentType = steamRes.headers.get('content-type');
        if (!steamRes.ok || !contentType?.includes('application/json')) {
          const text = await steamRes.text();
          console.error('❌ Steam API error body:', text);
          throw new Error('Invalid Steam API response');
        }

        const steamJson = await steamRes.json();
        const playerList = steamJson.response.players;

        if (!playerList.length) {
          steamText = `❌ Steam ID not found or profile is private.`;
        } else {
          const playerInfo = playerList[0];
          const persona = playerInfo.personaname;
          const status = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to Trade', 'Looking to Play'][playerInfo.personastate] || 'Unknown';

          steamText = [
            `👤 Steam Name: **${persona}**`,
            `🌐 Steam Profile: ${playerInfo.profileurl}`,
            `💡 Steam Status: **${status}**`
          ].join('\n');
        }
      }

      interaction.editReply({ content: `${bmText}\n\n${steamText}` });

    } catch (err) {
      console.error(err);
      interaction.editReply(`⚠️ API Error: ${err.message}`);
    }
  }

  // === /permissions ===
  if (interaction.commandName === 'permissions') {
    if (interaction.user.id !== '1096566768421580912') {
      return interaction.reply({ content: '❌ You cannot manage permissions.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const type = interaction.options.getString('type');
    const id = interaction.options.getString('id');

    if (sub === 'add') {
      const cmd = interaction.options.getString('command');
      const cmds = [cmd];

      if (type === 'user') permissions.users[id] = cmds;
      else permissions.roles[id] = cmds;

      fs.writeFileSync('./permissions.json', JSON.stringify(permissions, null, 2));
      return interaction.reply({
        content: `✅ Added **${type}** \`${id}\` with access to: \`${cmds.join(', ')}\``,
        ephemeral: true
      });
    }

    if (sub === 'remove') {
      if (type === 'user') delete permissions.users[id];
      else delete permissions.roles[id];

      fs.writeFileSync('./permissions.json', JSON.stringify(permissions, null, 2));
      return interaction.reply({
        content: `✅ Removed **${type}** \`${id}\` from permissions.`,
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);
