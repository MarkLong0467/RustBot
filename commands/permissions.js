const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getPermissions, updatePermissions } = require('../utils/permissionHandler.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('Manage or view command permissions')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a user or role to a command')
        .addStringOption(o => o.setName('command').setDescription('Command name or "all"').setRequired(true))
        .addStringOption(o => o.setName('type').setDescription('user or role').setRequired(true))
        .addStringOption(o => o.setName('id').setDescription('User ID or Role ID').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a user or role from a command')
        .addStringOption(o => o.setName('command').setDescription('Command name or "all"').setRequired(true))
        .addStringOption(o => o.setName('type').setDescription('user or role').setRequired(true))
        .addStringOption(o => o.setName('id').setDescription('User ID or Role ID').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all command permissions'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'list') {
      const perms = getPermissions();
      if (!perms || Object.keys(perms).length === 0) {
        return interaction.reply({ content: '📜 **Permissions:**\n\nNo permissions set.', ephemeral: true });
      }

      let out = '📜 **Permissions:**\n\n';
      for (const cmd in perms) {
        out += `**/${cmd}**\n`;
        const u = perms[cmd].users.map(x => `<@${x}>`).join(', ') || 'None';
        const r = perms[cmd].roles.map(x => `<@&${x}>`).join(', ') || 'None';
        out += `Users: ${u}\nRoles: ${r}\n\n`;
      }

      return interaction.reply({ content: out, ephemeral: true });
    }

    const command = interaction.options.getString('command').toLowerCase();
    const type = interaction.options.getString('type');
    const id = interaction.options.getString('id');

    if (!['user', 'role'].includes(type)) {
      return interaction.reply({ content: '❌ Invalid type.', ephemeral: true });
    }

    const add = sub === 'add';
    const updated = updatePermissions(command, type, id, add);

    if (updated === 'exists') {
      return interaction.reply({ content: `⚠️ Already added to \`${command}\`.`, ephemeral: true });
    }

    if (updated === 'removed') {
      return interaction.reply({ content: `🗑️ Removed from \`${command}\`.`, ephemeral: true });
    }

    if (updated === 'added') {
      return interaction.reply({ content: `✅ Updated permissions for \`${command}\`.`, ephemeral: true });
    }

    return interaction.reply({ content: '❌ Failed to update permissions.', ephemeral: true });
  }
};
