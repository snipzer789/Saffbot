const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(client, interaction, channel) {
		await interaction.reply({content: 'Pong!', ephemeral: true});
	},
};