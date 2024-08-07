const { Client, GatewayIntentBits, Events, Partials, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

//	variables
const message_Logger_id = '1186681602361798767';
const stream_announcement_id = '1080156472488497253';
const complaints_channel = '1252340611332313108'

// need to keep those api keys secret you know
let DiscordKey = process.env.DiscordTolken;

// discord setup bullshit
const Discord_Client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.GuildPresences,
	],
	partials: [
		Partials.Channel, // Required to receive DMs
	],
});

Discord_Client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			Discord_Client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

Discord_Client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

Discord_Client.cooldowns = new Collection();
Discord_Client.COOLDOWN_SECONDS = 180; // replace with desired cooldown time in seconds

Discord_Client.on(Events.InteractionCreate, async (interaction) => {

	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		channels = Discord_Client.channels.cache.get(complaints_channel);
		await command.execute(Discord_Client, interaction, channels);
	} catch (error) {
		console.log(error)
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// just logs in to saffbot
Discord_Client.login(DiscordKey);

const remove_linebreaks = (str) => {
	let newstr = '';

	// Looop and traverse string
	for (let i = 0; i < str.length; i++) if (!(str[i] == '\n' || str[i] == '\r')) newstr += str[i];
	return newstr;
};

const MESSAGELOGGER_DIR = './Messages_logger';
let Discord_Channel_Array = [];
const ReadMessageloggerDir = async () => {
	fs.readdir(MESSAGELOGGER_DIR, (err, files) => {
		if (err) console.log(err);
		else {
			files.forEach((file) => {
				Discord_Channel_Array.push(file);
			});
		}
	});
};
const discordchannelexists = (discordChannelId) => {
	let found = false;
	for (let i = 0; i != Discord_Channel_Array.length; i++) {
		if (discordChannelId + '.csv' == Discord_Channel_Array[i]) {
			console.log('found');
			found = true;
		}
	}
	return found;
};
const CreateChannelcsv = (MessageChannelId) => {
	if (discordchannelexists(MessageChannelId) != true) {
		console.log('channel not found');
		fs.writeFileSync(`${MESSAGELOGGER_DIR}/${MessageChannelId}.csv`, 'MessageId,AuthorName,CreatedTimeStamp,Reply,Attachment_url,Content,MentionedUsers,EditedTimeStamp,EditedAttachements,EditedContent,', (err) => {
			if (err) console.log(err);
		});
		Discord_Channel_Array.push(`${MessageChannelId}.csv`);
	}
};
const SaveMessageTocsv = async (message_raw) => {
	let Reply = '';
	let attachment_array = message_raw.attachments.map((x) => JSON.stringify(x.url));
	let attachment_log = '';
	//checks if array exits has more items than 1
	if (attachment_array.length > 1) {
		attachment_log = attachment_array.join('¬');
	} else if (attachment_array.length == 1) {
		attachment_log = attachment_array[0];
	}

	//checks if the message is a reply to a user
	if (message_raw.mentions.repliedUser != null) {
		Reply = `${message_raw.mentions.repliedUser.username} $ ${message_raw.mentions.repliedUser}`;
	}
	// checks mentioned users in a message, for later replacement in Content
	let Mentions_username_array = [];
	let Mentions_Id_array = [];
	let mentionedUsers = '';
	if (message_raw.mentions.users != null) {
		Mentions_username_array = message_raw.mentions.users.map((x) => JSON.stringify(x.username));
		Mentions_Id_array = message_raw.mentions.users.map((x) => JSON.stringify(x.id));

		for (let i = 0; i < Mentions_username_array.length; i++) {
			mentionedUsers = mentionedUsers + `${Mentions_username_array[i].split('"')[1]}$${Mentions_Id_array[i].split('"')[1]} ¬ `;
		}
	}

	// input sanitization
	// commas break csv files since "comma seperated"
	let MessageContent = message_raw.content.replace(/,/g, ' ');
	MessageContent = MessageContent.replace(/"/g, ' ');

	// single quote breaks csv files so just going to remove them all

	// line breaks also break csv files need to remove them
	MessageContent = remove_linebreaks(MessageContent);

	// saves message to csv file of the channel where it was sent
	fs.appendFile(`${MESSAGELOGGER_DIR}/${message_raw.channelId}.csv`, `\n${message_raw.id},${message_raw.author.username},${message_raw.createdTimestamp},${Reply},${attachment_log},${MessageContent},${mentionedUsers},,,,`, (err) => {
		if (err) {
			console.log(err);
		} else {
		}
	});
};
const PostMessage_guild = (message) => {
	let attachment_array = message.attachments.map((x) => JSON.stringify(x.url));
	let attachment_log = '';
	if (attachment_array.length > 1) {
		attachment_log = attachment_array.join('¬');
	} else if (attachment_array.length == 1) {
		attachment_log = attachment_array[0];
		attachment_log = `< ${attachment_log} >: |`;
	} else {
		attachment_log = '';
	}

	//checks if the message is a reply to a user
	if (message.mentions.repliedUser != null) {
		Reply = `${message.mentions.repliedUser.username} $ ${message.mentions.repliedUser}`;
	} else {
		Reply = '';
	}

	// checks mentioned users in a message, for later replacement in Content
	let Mentions_username_array = [];
	let Mentions_Id_array = [];
	let mentionedUsers = '';
	let content = message.content;
	if (message.mentions.users != null) {
		Mentions_username_array = message.mentions.users.map((x) => JSON.stringify(x.username));
		Mentions_Id_array = message.mentions.users.map((x) => JSON.stringify(x.id));

		for (let i = 0; i < Mentions_username_array.length; i++) {
			mentionedUsers = mentionedUsers + `${Mentions_username_array[i].split('"')[1]}$${Mentions_Id_array[i].split('"')[1]} ¬ `;
		}
	}

	// replys
	output_reply = [];
	if (Reply != '') {
		output_reply = Reply.split(' $ ')[0];
	}
	let OutputTimestamp = Math.round(message.createdTimestamp / 1000);
	let MessageContent = remove_linebreaks(content);

	let mentioned_users_array = mentionedUsers.split(' ¬ ');
	let mentioned_users_array_split = [];
	for (let i = 0; i < mentioned_users_array.length - 1; i++) {
		mentioned_users_array_split.push(mentioned_users_array[i].split('$'));
	}

	for (let i = 0; i < mentioned_users_array_split.length; i++) {
		MessageContent = MessageContent.replace(`<@${mentioned_users_array_split[i][1]}>`, `${mentioned_users_array_split[i][0]}`);
	}
	MessageContent = MessageContent.replace(`@everyone`, 'everyone');
	outgoing_log = ' <t:' + OutputTimestamp + ':d> |  ' + attachment_log + ' ' + '< https://discord.com/channels/' + message.guildId + '/' + message.channelId + ' >: | ' + message.author.username + ': ' + MessageContent + ' | Reply: ' + output_reply;
	if (outgoing_log.length > 2000) {
		let OverLimit = outgoing_log.length - 2000;

		MessageContent = MessageContent.substring(0, MessageContent.length - OverLimit - 100);
		MessageContent = MessageContent + ' Message too long';
		outgoing_log = ' <t:' + OutputTimestamp + ':d> |  ' + attachment_log + ' ' + '< https://discord.com/channels/' + message.guildId + '/' + message.channelId + ' >: | ' + message.author.username + ': ' + MessageContent + ' | Reply: ' + output_reply;
		// if the messages is still longer then 2000 characters "Message Too long to be sent in discord" is sent, last resort in case of length
		if (outgoing_log.length > 2000) {
			outgoing_log = ' <t:' + OutputTimestamp + ':d> Message is too long to be sent in discord';
		}
	}

	if (outgoing_log != '') {
		const Logs_channel = Discord_Client.channels.cache.get(message_Logger_id);
		console.log(outgoing_log);
		Logs_channel.send({
			content: outgoing_log,
			flags: [4096],
		});
		return;
	}
};

ReadMessageloggerDir();

Discord_Client.on(Events.MessageCreate, async (message) => {
	if (message.guildId == 1080156043188899900) {
		if (message.guildId == null && message.author.bot == false && message.type != 18) {
			console.log('dm');
		}

		if (message.guildId != null && message.author.bot == false && message.type != 18) {
		//	CreateChannelcsv(message.channelId);
		//	SaveMessageTocsv(message);
		//	PostMessage_guild(message);
		}
	}
});

const saffId = '1054580330629189733';
Discord_Client.on(Events.PresenceUpdate, (oldPresence, newPresence) => {
	if (newPresence.userId == saffId) {
		if (newPresence.activities[0] != null) {
			if (newPresence.activities[0].type == 1) {
				let LastStreamUrl = fs.readFileSync('./LastStreamUrl.txt', {
					encoding: 'utf8',
					flag: 'r',
				});
				if (newPresence.activities[0].url != LastStreamUrl) {
					const channel = Discord_Client.channels.cache.get(stream_announcement_id);
					channel.send(`<@&1093184251979112539> Saff is now live: ${newPresence.activities[0].url}`);
					fs.writeFileSync('./LastStreamUrl.txt', `${newPresence.activities[0].url}`);
				}
			}
		}
	}
});

Discord_Client.on(Events.MessageCreate, (message) => {
	Hasrole = message.member.roles.cache.map((role) => role.id).join(', ');

	if (message.content.toLowerCase() == '!shill') {
		let shill_message_content = fs.readFileSync('./shill_message.txt', { encoding: 'utf8', flag: 'r' });
		if (Hasrole.includes('1080158505325051925') || Hasrole.includes('1080157304827154522') || message.author.id == '492307016795029515') {
			message.reply(shill_message_content);
		} else {
			console.log('You do not have perms');
		}
	}
});

Discord_Client.on(Events.MessageCreate, (message) => {
	Hasrole = message.member.roles.cache.map((role) => role.id).join(', ');
	if (message.content.toLowerCase().includes('!shillchange')) {
		if (Hasrole.includes('1080158505325051925') || Hasrole.includes('1080157304827154522') || message.author.id == '492307016795029515') {
			let content = message.content;

			content = content.split(' ');
			content.splice(0, 1);
			content = content.join(' ');

			fs.writeFileSync('./shill_message.txt', `${content}`);

			message.reply('changed');
		} else {
			console.log('You do not have perms');
		}
	}
});


