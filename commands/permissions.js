const { SlashCommandBuilder } = require('discord.js');
const { updatePermissions } = require('../utils/permissionHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('Manage command permissions')
    .addSubcommand(cmd =>
      cmd.setName('add').setDescription('Add permission')
        .addStringOption(opt =>
          opt.setName('type').setDescription('user or role').setRequired(true)
            .addChoices({ name: 'user', value: 'users' }, { name: 'role', value: 'roles' })
        )
        .addStringOption(opt =>
          opt.setName('id').setDescription('ID of user or role').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('command').setDescription('Command name').setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd.setName('remove').setDescription('Remove permission')
        .addStringOption(opt =>
          opt.setName('type').setDescription('user or role').setRequired(true)
            .addChoices({ name: 'user', value: 'users' }, { name: 'role', value: 'roles' })
        )
        .addStringOption(opt =>
          opt.setName('id').setDescription('ID of user or role').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('command').setDescription('Command name').setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const type = interaction.options.getString('type');
    const id = interaction.options.getString('id')?.trim();
    const command = interaction.options.getString('command')?.trim();

    if (!type || !id || !command) {
      return interaction.reply({ content: '❌ Missing input.', ephemeral: true });
    }

    updatePermissions(command, type, id, sub);
    await interaction.reply({ content: `✅ ${sub}ed ${type.slice(0, -1)} \`${id}\` for \`/${command}\`.`, ephemeral: true });
  }
};
