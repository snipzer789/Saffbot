const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('announce')
		.setDescription('forces through a saff stream announcement, (no worky)')
        .addStringOption(option => option.setName('url').setDescription('Need url for the announcement').setRequired(true))
        .addStringOption(option => option.setName('input').setDescription('The input to echo back').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),

    async execute(client, interaction, channel) {
        console.log(interaction)
    },
};