const fs = require('fs');
const path = require('path');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const dataPath = path.join(__dirname, '../data/lookup.json');
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({}));

function loadData() {
  return JSON.parse(fs.readFileSync(dataPath));
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

async function getLookupData(input, userId) {
  const db = loadData();
  const now = Date.now();
  const id = input.trim().toLowerCase();

  if (db[id] && now - db[id].lastLookup < 5 * 60 * 1000) {
    db[id].searches += 1;
    saveData(db);
    return buildEmbed(db[id]);
  }

  const result = {
    name: "MarkLong0467",
    steamId: "76561198133620640",
    createdAt: "Apr 19, 2024",
    risk: "High",
    reports: 3,
    hours: 82,
    bans: 3,
    searches: (db[id]?.searches || 0) + 1,
    lastLookup: now,
    isWhitelisted: false,
    isInClan: false,
    isBlacklisted: false
  };

  db[id] = result;
  saveData(db);

  return buildEmbed(result);
}

function buildEmbed(data) {
  const embed = new EmbedBuilder()
    .setTitle(data.name)
    .setDescription(`Risk Level: **${data.risk}**\\nAccount has ${data.bans} bans, ${data.hours} hours`)
    .addFields(
      { name: "Steam ID", value: data.steamId, inline: true },
      { name: "Created", value: data.createdAt, inline: true },
      { name: "Reports", value: `${data.reports}`, inline: true },
      { name: "Searches", value: `${data.searches}`, inline: true }
    )
    .setColor(data.risk === 'High' ? 0xff0000 : 0x00ff00)
    .setFooter({ text: `Last updated: ${new Date(data.lastLookup).toLocaleString()}` });

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('whitelist').setLabel('Whitelist').setStyle(ButtonStyle.Success).setDisabled(data.isWhitelisted),
    new ButtonBuilder().setCustomId('in_clan').setLabel('In Clan').setStyle(ButtonStyle.Secondary).setDisabled(data.isInClan),
    new ButtonBuilder().setCustomId('blacklist').setLabel('Blacklist').setStyle(ButtonStyle.Danger).setDisabled(data.isBlacklisted),
    new ButtonBuilder().setCustomId('export').setLabel('Export').setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('graph').setLabel('📊 Graph').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('view_history').setLabel('📜 View History').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('public_view').setLabel('🌐 Public View').setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2] };
}

module.exports = { getLookupData };
