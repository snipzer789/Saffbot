const { Client, GatewayIntentBits, Events, Partials, MessageManager } = require('discord.js');
const fs = require('node:fs');
const csv = require('csv-parser');
require('dotenv').config();

//	variables
const message_Logger_id = '1198380107409145906';
const stream_announcement_id = '1178843756603113593';
const saffId = '1054580330629189733';

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

// just logs in to saffbot
Discord_Client.login(DiscordKey);
Discord_Client.once(Events.ClientReady, (c) => {
	console.log(`Saffbot alive.`);
});

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
    fs.appendFile(
        `${MESSAGELOGGER_DIR}/${message_raw.channelId}.csv`,
        `\n${message_raw.id},${message_raw.author.username},${message_raw.createdTimestamp},${Reply},${attachment_log},${MessageContent},${mentionedUsers},,,,`,
        (err) => {
            if (err) {
                console.log(err);
            } else {
            }
        }
    );
};

ReadMessageloggerDir();

const COMPLAINTSLOGGER_DIR = './Complaints_logger';
let Discord_Dm_Array = [];
const ReadComplaintsloggerDir = async () => {
    fs.readdir(COMPLAINTSLOGGER_DIR, (err, files) => {
        if (err) console.log(err);
        else {
            files.forEach((file) => {
                Discord_Dm_Array.push(file);
            });
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
const SaveDmTocsv = async (message_raw) => {
    let Reply = '';
    let attachment_array = message_raw.attachments.map((x) =>
        JSON.stringify(x.url)
    );
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
        Mentions_username_array = message_raw.mentions.users.map((x) =>
            JSON.stringify(x.username)
        );
        Mentions_Id_array = message_raw.mentions.users.map((x) =>
            JSON.stringify(x.id)
        );

        for (let i = 0; i < Mentions_username_array.length; i++) {
            mentionedUsers =
                mentionedUsers +
                `${Mentions_username_array[i].split('"')[1]}$${
                    Mentions_Id_array[i].split('"')[1]
                } ¬ `;
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
    fs.appendFile(
        `${COMPLAINTSLOGGER_DIR}/${message_raw.channelId}.csv`,
        `\n${message_raw.id},${message_raw.author.username},${message_raw.createdTimestamp},${Reply},${attachment_log},${MessageContent},${mentionedUsers},,,,`,
        (err) => {
            if (err) {
                console.log(err);
            } else {
            }
        }
    );
};
const PostMessage_dm = (message) => {

    let attachment_array = message.attachments.map((x) => JSON.stringify(x.url))
    let attachment_log = ''
    if(attachment_array.length > 1){
        attachment_log = attachment_array.join('¬')
    } else if (attachment_array.length == 1){
        attachment_log = attachment_array[0]
    } else {
        attachment_log = 'No attachements'
    }
    
    //checks if the message is a reply to a user
    if (message.mentions.repliedUser != null) {
        Reply = `${message.mentions.repliedUser.username} $ ${message.mentions.repliedUser}`
    } else {
        Reply = 'No reply'
    }

    // checks mentioned users in a message, for later replacement in Content
    let Mentions_username_array = []
    let Mentions_Id_array = []
    let mentionedUsers = ''
    let content = message.content
    if (message.mentions.users != null){
        Mentions_username_array = message.mentions.users.map((x) => JSON.stringify(x.username))
        Mentions_Id_array = message.mentions.users.map((x) => JSON.stringify(x.id))
  
        for(let i = 0; i < Mentions_username_array.length; i++){
            mentionedUsers = mentionedUsers + `${Mentions_username_array[i].split('"')[1]}$${Mentions_Id_array[i].split('"')[1]} ¬ `
        }
    }
    
    // replys
    output_reply = []
    if(Reply != 'no reply'){
        output_reply = Reply.split(' $ ')[0]
    }
    let OutputTimestamp = Math.round(message.createdTimestamp/1000)
    let MessageContent = remove_linebreaks(content)
    
    let mentioned_users_array = mentionedUsers.split(' ¬ ')
    let mentioned_users_array_split = []
    for(let i = 0; i<mentioned_users_array.length-1; i++){
        mentioned_users_array_split.push(mentioned_users_array[i].split('$'))
    }

    for(let i = 0; i < mentioned_users_array_split.length; i++){
        MessageContent = MessageContent.replace(`<@${mentioned_users_array_split[i][1]}>`, `${mentioned_users_array_split[i][0]}`)
    }
    outgoing_log = ' <t:' + OutputTimestamp + ':d> | ' + message.author.username + ': < ' + attachment_log + ' >: ' + MessageContent + ' | Reply: ' + output_reply
    
    if(outgoing_log.length > 2000){
        let OverLimit = outgoing_log.length - 2000

        MessageContent = MessageContent.substring(0, (MessageContent.length - OverLimit)- 100)
        MessageContent = MessageContent + ' Message too long'
        outgoing_log = ' <t:' + OutputTimestamp + ':d> | ' + message.author.username + ': < ' + attachment_log + ' >: ' + MessageContent + ' | Reply: ' + output_reply
        // if the messages is still longer then 2000 characters "Message Too long to be sent in discord" is sent, last resort in case of length
        if(outgoing_log.length > 2000){ outgoing_log = ' <t:' + OutputTimestamp + ':d> Message is too long to be sent in discord'}
    }

    if (outgoing_log != '') {
        console.log(outgoing_log)
        return outgoing_log
    }

}

let ComplaintId = 0
fs.readFileSync('ComplaintIdNum.txt', 'utf8', function(err, data){
  if(err){
    console.log(err)
  }
  ComplaintId = data
});

const CreateComplaintThread = async (message) => {
    const Complaintschannel = Discord_Client.channels.cache.get("1198380107409145906");
    const thread =  await Complaintschannel.threads.create({
      name: `Complaint Id: ${ComplaintId}`,
    });
    thread.send(message.content)
    console.log(`Created thread: ${thread.name}`);
    ComplaintId++
    fs.writeFileSync('ComplaintIdNum.txt', `${ComplaintId}`);   
}

ReadComplaintsloggerDir();

Discord_Client.on(Events.MessageCreate, async (message) => {
    //console.log(Discord_Channel_Array);
    if (message.guildId == null && message.author.bot == false) {
        console.log('this is a dm sent by a human');
        CreateDmcsv(message.channelId);
    }
    if (message.guildId != null && message.author.bot == false) {
        console.log('this is a discord server sent by a human');
        CreateChannelcsv(message.channelId);
        SaveMessageTocsv(message);
    }

    Discord_Channel_Array = [];
    Discord_Dm_Array = [];
    await ReadMessageloggerDir();
    await ReadComplaintsloggerDir();
});
