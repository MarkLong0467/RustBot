require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'check') {
    const query = interaction.options.getString('name'); // Can be SteamID, URL, name, etc.
    const url = `https://api.battlemetrics.com/players?filter[search]=${encodeURIComponent(query)}`;

    await interaction.deferReply();

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.data.length) {
        return interaction.editReply(`❌ No player found for \`${query}\``);
      }

      const player = data.data[0];
      const name = player.attributes.name || 'Unknown';
      const online = player.attributes.online;
      const lastSeen = player.attributes.lastSeen;
      const serverID = player.relationships.server?.data?.id || 'None';
      const bmProfile = `https://www.battlemetrics.com/rcon/players/${player.id}`;

      interaction.editReply({
        content:
          `🎮 Player: **${name}**\n` +
          `🌐 BattleMetrics: ${bmProfile}\n` +
          `🔎 Status: **${online ? '🟢 Online' : '🔴 Offline'}**\n` +
          (online
            ? `📌 Server ID: \`${serverID}\``
            : `🕓 Last Seen: <t:${Math.floor(new Date(lastSeen).getTime() / 1000)}:R>`) 
      });
    } catch (err) {
      console.error(err);
      interaction.editReply(`⚠️ API Error`);
    }
  }
});

client.login(process.env.TOKEN);
