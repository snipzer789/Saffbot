const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('complaint')
		.setDescription('Starts a complaint, (3 min cooldown)')
		.addStringOption((option) => option.setName('reason').setDescription('Tldr reason for the complaint').setMaxLength(100).setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
		.setDMPermission(false),

	async execute(client, interaction, channel) {
        let user_id = await interaction.user.id
        console.log(user_id)
		if (client.cooldowns.has(interaction.user.id)) {
			// cooldown not ended
			interaction.reply({ content: 'Please wait for cooldown to end (3 minutes after the first complaint)', ephemeral: true });
		} else {
			// no cooldown 
			console.log(interaction);
			let count = fs.readFileSync('./count', {
				encoding: 'utf8',
				flag: 'r',
			});
			count = parseInt(count);
			const reason = interaction.options.getString('reason');
			const thread = await channel.threads.create({
				name: reason + ' : ' + count,
				type: ChannelType.PrivateThread,
				reason: 'complaint',
			});
			await thread.members.add(interaction.user.id);
			console.log(`Created thread: ${thread.name}`);
			await interaction.reply({ content: 'Creating a complaint thread for ' + reason, ephemeral: true });
			// console.log(interaction)
			count = count + 1;
			fs.writeFileSync('./count', `${count}`);
			//now, set cooldown
			client.cooldowns.set(interaction.user.id, true);

			// After the time you specified, remove the cooldown
			setTimeout(() => {
				client.cooldowns.delete(interaction.user.id);
			}, client.COOLDOWN_SECONDS * 1000);
		}
	},
};
