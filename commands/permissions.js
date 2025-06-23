const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updatePermissions } = require('../utils/permissionHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('Manage who can use which commands')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Allow a user or role to use a command')
        .addStringOption(o =>
          o.setName('type')
            .setDescription('user or role')
            .setRequired(true)
            .addChoices(
              { name: 'user', value: 'user' },
              { name: 'role', value: 'role' }
            )
        )
        .addStringOption(o =>
          o.setName('id')
            .setDescription('Discord ID or mention')
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName('command')
            .setDescription('Command to allow')
            .setRequired(true)
            .addChoices(
              { name: 'check', value: 'check' },
              { name: 'track', value: 'track' },
              { name: 'trackadd', value: 'trackadd' },
              { name: 'trackremove', value: 'trackremove' },
              { name: 'permissions', value: 'permissions' }
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove permission from a user or role')
        .addStringOption(o =>
          o.setName('type')
            .setDescription('user or role')
            .setRequired(true)
            .addChoices(
              { name: 'user', value: 'user' },
              { name: 'role', value: 'role' }
            )
        )
        .addStringOption(o =>
          o.setName('id')
            .setDescription('Discord ID or mention')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const type = interaction.options.getString('type');
    const idInput = interaction.options.getString('id');
    const commandName = interaction.options.getString('command');

    const requester = interaction.user.id;
    if (requester !== '1096566768421580912') {
      return interaction.reply({ content: '❌ Only the bot owner can manage permissions.', ephemeral: true });
    }

    const id = idInput.replace(/<@&?|>/g, '');
    if (!/^\d+$/.test(id)) {
      return interaction.reply({ content: '❌ Invalid ID or mention.', ephemeral: true });
    }

    const added = sub === 'add';
    const success = updatePermissions(type, id, commandName, added);

    const action = added ? 'added' : 'removed';
    if (success) {
      return interaction.reply({ content: `✅ Permission ${action} for ${type} \`${id}\` to use \`${commandName}\`.`, ephemeral: true });
    } else {
      return interaction.reply({ content: '❌ Failed to update permissions.', ephemeral: true });
    }
  }
};
