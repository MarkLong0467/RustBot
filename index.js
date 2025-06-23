require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const allowedUsers = ['1096566768421580912'];
const allowedRoles = ['123456789012345678'];
const cooldowns = new Map(); // per-user cooldown
let lastGlobalCheckTime = 0; // global cooldown

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

  // === /check ===
  if (interaction.commandName === 'check') {
    if (!isAllowed(interaction)) {
      return interaction.reply({ content: '❌ You’re not allowed to use this command.', ephemeral: true });
    }

    const now = Date.now();
    const globalCooldown = 5000;
    const userCooldown = 10000;

    // Global cooldown
    if (now - lastGlobalCheckTime < globalCooldown) {
      const wait = ((globalCooldown - (now - lastGlobalCheckTime)) / 1000).toFixed(1);
      return interaction.reply({ content: `⏳ Global cooldown active. Try again in ${wait}s.`, ephemeral: true });
    }

    // Per-user cooldown
    const lastUsed = cooldowns.get(interaction.user.id) || 0;
    if (now - lastUsed < userCooldown) {
      const wait = ((userCooldown - (now - lastUsed)) / 1000).toFixed(1);
      return interaction.reply({ content: `⏳ Wait ${wait}s before using this again.`, ephemeral: true });
    }

    lastGlobalCheckTime = now;
    cooldowns.set(interaction.user.id, now);

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
          { name: 'Player ID', value: bmPlayer.id, inline: false }
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
        const contentType = steamRes.headers.get('content-type') || '';

        if (steamRes.status === 429) {
          console.warn('🚫 Steam rate limited');
          steamEmbed = new EmbedBuilder().setColor(0xff9900).setDescription('🚫 Steam API rate limit. Try again later.');
        } else if (!steamRes.ok || !contentType.includes('application/json')) {
          const text = await steamRes.text();
          console.error('❌ Steam API error body:', text);
          throw new Error('Invalid Steam API response');
        } else {
          const steamJson = await steamRes.json();
          const playerList = steamJson.response.players;

          if (!playerList.length) {
            steamEmbed = new EmbedBuilder().setColor(0xff0000).setDescription(`❌ Steam ID not found or profile is private.`);
          } else {
            const p = playerList[0];
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
      }

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
  }

  // === /permissions ===
  if (interaction.commandName === 'permissions') {
    if (interaction.user.id !== '1096566768421580912') {
      return interaction.reply({ content: '❌ You can’t manage permissions.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const type = interaction.options.getString('type');
    const id = interaction.options.getString('id');
    const path = './permissions.json';

    const validId = /^\d{17,19}$/.test(id);
    if (!validId) {
      return interaction.reply({ content: '⚠️ Invalid Discord ID.', ephemeral: true });
    }

    let permissions = fs.existsSync(path)
      ? JSON.parse(fs.readFileSync(path))
      : { users: {}, roles: {} };

    if (sub === 'add') {
      const cmd = interaction.options.getString('command');
      const validCmds = ['check', 'permissions'];
      if (!validCmds.includes(cmd)) {
        return interaction.reply({ content: '❌ Invalid command name.', ephemeral: true });
      }

      if (type === 'user') permissions.users[id] = [cmd];
      else permissions.roles[id] = [cmd];

      fs.writeFileSync(path, JSON.stringify(permissions, null, 2));
      return interaction.reply({
        content: `✅ Added ${type} \`${id}\` with \`${cmd}\` access.`,
        ephemeral: true
      });
    }

    if (sub === 'remove') {
      if (type === 'user') delete permissions.users[id];
      else delete permissions.roles[id];

      fs.writeFileSync(path, JSON.stringify(permissions, null, 2));
      return interaction.reply({
        content: `✅ Removed ${type} \`${id}\` from permissions.`,
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);
