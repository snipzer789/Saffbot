const { Client, GatewayIntentBits, Events, Partials } = require('discord.js');
const fs = require('node:fs');
const csv = require('csv-parser');
require('dotenv').config();

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
    for (let i = 0; i < str.length; i++)
        if (!(str[i] == '\n' || str[i] == '\r')) newstr += str[i];
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
        fs.writeFileSync(
            `${MESSAGELOGGER_DIR}/${MessageChannelId}.csv`,
            'MessageId,AuthorName,CreatedTimeStamp,Reply,Attachment_url,Content,MentionedUsers,EditedTimeStamp,EditedAttachements,EditedContent,',
            (err) => {
                if (err) console.log(err);
            }
        );
        Discord_Channel_Array.push(`${MessageChannelId}.csv`);
    }
};
const SaveMessageTocsv = async (message_raw) => {
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
const discordDmexists = (discordChannelId) => {
    let found = false;
    for (let i = 0; i != Discord_Dm_Array.length; i++) {
        if (discordChannelId + '.csv' == Discord_Dm_Array[i]) {
            console.log('found');
            found = true;
        }
    }
    return found;
};
const CreateDmcsv = (MessageChannelId) => {
    if (discordDmexists(MessageChannelId) != true) {
        console.log('channel not found');
        fs.writeFileSync(
            `${COMPLAINTSLOGGER_DIR}/${MessageChannelId}.csv`,
            'MessageId,AuthorName,CreatedTimeStamp,Reply,Attachment_url,Content,MentionedUsers,EditedTimeStamp,EditedAttachements,EditedContent,',
            (err) => {
                if (err) console.log(err);
            }
        );
        Discord_Dm_Array.push(`${MessageChannelId}.csv`);
    }
};

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
