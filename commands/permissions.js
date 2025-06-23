const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updatePermissions, getPermissions } = require('../utils/permissionHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('Manage or view command permissions')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Allow a user or role to use a command')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('user or role')
            .setRequired(true)
            .addChoices(
              { name: 'user', value: 'user' },
              { name: 'role', value: 'role' },
              { name: 'all', value: 'all' }
            )
        )
        .addStringOption(opt =>
          opt.setName('id')
            .setDescription('User ID, role ID, or @mention')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('command')
            .setDescription('Command name')
            .setRequired(true)
            .addChoices(
              { name: 'check', value: 'check' },
              { name: 'permissions', value: 'permissions' },
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove permission from a user or role')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('user or role')
            .setRequired(true)
            .addChoices(
              { name: 'user', value: 'user' },
              { name: 'role', value: 'role' },
            )
        )
        .addStringOption(opt =>
          opt.setName('id')
            .setDescription('User ID, role ID, or @mention')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('command')
            .setDescription('Command name')
            .setRequired(true)
            .addChoices(
              { name: 'check', value: 'check' },
              { name: 'permissions', value: 'permissions' },
              { name: 'all', value: 'all' }
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('View all command permissions')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'list') {
      const perms = getPermissions();
      const out = Object.entries(perms).map(([cmd, data]) => {
        const users = data.users.map(u => `<@${u}>`).join(', ') || 'None';
        const roles = data.roles.map(r => `<@&${r}>`).join(', ') || 'None';
        return `**/${cmd}**\n👤 Users: ${users}\n🎭 Roles: ${roles}`;
      }).join('\n\n');

      return interaction.reply({
        content: `📜 **Permissions:**\n\n${out || 'No permissions set.'}`,
        ephemeral: true
      });
    }

    const command = interaction.options.getString('command');
    const type = interaction.options.getString('type');
    const rawId = interaction.options.getString('id');
    const id = rawId.replace(/[<@&!>]/g, '');
    const add = sub === 'add';

    const success = updatePermissions(command, type, id, add);
    if (!success) {
      return interaction.reply({ content: '❌ Failed to update permissions.', ephemeral: true });
    }

    return interaction.reply({
      content: `✅ Updated permissions for \`${command}\`.`,
      ephemeral: true
    });
  }
};
