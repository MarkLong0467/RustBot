function buildRiskEmbed(profileData) {
  return {
    title: profileData.name,
    description: 'Risk level: ' + profileData.risk,
    fields: [
      { name: 'Steam ID', value: profileData.steamId },
      { name: 'Created', value: profileData.createdAt },
    ]
  };
}

module.exports = { buildRiskEmbed };
