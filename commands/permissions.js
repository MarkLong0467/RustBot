const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { updatePermissions, isAllowed } = require('../utils/permissionHandler.js');

const permissionsPath = path.join(__dirname, '..', 'data', 'permissions.json');
function savePermissions(data) {
  fs.writeFileSync(permissionsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('Manage command access')
    .addSubcommand(cmd =>
      cmd.setName('add')
        .setDescription('Give access to a user or role for a command')
        .addStringOption(opt => opt.setName('type').setDescription('user, role, or all').setRequired(true))
        .addStringOption(opt => opt.setName('id').setDescription('Discord ID (ignored for all)').setRequired(false))
        .addStringOption(opt => opt.setName('command').setDescription('Command name').setRequired(true))
    )
    .addSubcommand(cmd =>
      cmd.setName('remove')
        .setDescription('Remove access from a user or role for a command')
        .addStringOption(opt => opt.setName('type').setDescription('user, role, or all').setRequired(true))
        .addStringOption(opt => opt.setName('id').setDescription('Discord ID (ignored for all)').setRequired(false))
        .addStringOption(opt => opt.setName('command').setDescription('Command name').setRequired(true))
    )
    .addSubcommand(cmd =>
      cmd.setName('list')
        .setDescription('View current permissions')
        .addStringOption(opt => opt.setName('command').setDescription('Command name to view').setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (!isAllowed(interaction.user.id, 'permissions', interaction.member)) {
      return interaction.reply({ content: '❌ Not allowed.', ephemeral: true });
    }

    const perms = require(permissionsPath);

    if (sub === 'list') {
      const cmd = interaction.options.getString('command');
      if (cmd) {
        const entry = perms[cmd];
        if (!entry) return interaction.reply(`❌ No permissions set for \`${cmd}\``);
        return interaction.reply(`📋 **${cmd}**:\n👤 Users: ${entry.users.join(', ') || 'None'}\n📛 Roles: ${entry.roles.join(', ') || 'None'}`);
      } else {
        const output = Object.entries(perms).map(([cmd, data]) => {
          return `**/${cmd}**:\n👤 ${data.users.join(', ') || 'None'}\n📛 ${data.roles.join(', ') || 'None'}`;
        }).join('\n\n') || 'No permissions set.';
        return interaction.reply({ content: `📜 All Permissions:\n\n${output}`, ephemeral: true });
      }
    }

    const type = interaction.options.getString('type');
    const id = interaction.options.getString('id');
    const command = interaction.options.getString('command');
    perms[command] = perms[command] || { users: [], roles: [] };

    if (sub === 'add') {
      if (type === 'all') {
        perms[command] = { users: ['*'], roles: ['*'] };
        savePermissions(perms);
        updatePermissions();
        return interaction.reply(`✅ Everyone now has access to \`${command}\``);
      }

      if (!id) return interaction.reply({ content: '❌ Missing ID.', ephemeral: true });
      if (!perms[command][`${type}s`].includes(id)) {
        perms[command][`${type}s`].push(id);
        savePermissions(perms);
        updatePermissions();
        return interaction.reply(`✅ Added ${type} \`${id}\` to \`${command}\``);
      } else {
        return interaction.reply(`⚠️ ${type} already has access.`);
      }
    }

    if (sub === 'remove') {
      if (type === 'all') {
        perms[command] = { users: [], roles: [] };
        savePermissions(perms);
        updatePermissions();
        return interaction.reply(`✅ Removed access from everyone for \`${command}\``);
      }

      if (!id) return interaction.reply({ content: '❌ Missing ID.', ephemeral: true });
      const list = perms[command][`${type}s`];
      const index = list.indexOf(id);
      if (index > -1) {
        list.splice(index, 1);
        savePermissions(perms);
        updatePermissions();
        return interaction.reply(`✅ Removed ${type} \`${id}\` from \`${command}\``);
      } else {
        return interaction.reply(`⚠️ ${type} \`${id}\` not found in \`${command}\``);
      }
    }
  }
};
