const fs = require('fs');
const path = require('path');

const lookupPath = path.join(__dirname, '../data/lookup.json');
if (!fs.existsSync(lookupPath)) fs.writeFileSync(lookupPath, JSON.stringify({}));

function loadLookupData() {
  return JSON.parse(fs.readFileSync(lookupPath));
}

function saveLookupData(data) {
  fs.writeFileSync(lookupPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    const message = interaction.message;
    const embed = message.embeds[0];
    if (!embed) return;

    const steamIdField = embed.fields.find(f => f.name === 'Steam ID');
    if (!steamIdField) return;

    const steamId = steamIdField.value.trim();
    const db = loadLookupData();

    if (!db[steamId]) return interaction.reply({ content: '❌ Profile not found in cache.', ephemeral: true });

    const profile = db[steamId];

    switch (customId) {
      case 'whitelist':
        profile.isWhitelisted = true;
        break;
      case 'in_clan':
        profile.isInClan = true;
        break;
      case 'blacklist':
        profile.isBlacklisted = true;
        break;
      case 'export':
        return interaction.reply({
          files: [{
            attachment: Buffer.from(JSON.stringify(profile, null, 2)),
            name: `${steamId}_profile.json`
          }],
          ephemeral: true
        });
      case 'graph':
        return interaction.reply({
          content: '📊 Activity graph not yet implemented in this demo.',
          ephemeral: true
        });
      case 'view_history':
        return interaction.reply({
          content: `📜 Showing cached profile for ${steamId}`,
          ephemeral: true
        });
      case 'public_view':
        return interaction.reply({
          content: `🌐 Public view for SteamID: ${steamId} → https://steamcommunity.com/profiles/${steamId}`,
          ephemeral: true
        });
      default:
        return;
    }

    db[steamId] = profile;
    saveLookupData(db);

    return interaction.reply({ content: `✅ Updated ${customId.replace('_', ' ')} for ${steamId}`, ephemeral: true });
  }
};
