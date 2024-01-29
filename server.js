const {Client, GatewayIntentBits, Events, Partials } = require("discord.js");
const fs = require('node:fs');
const csv = require('csv-parser');
require("dotenv").config();

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
  ]
});
// just logs in to saffbot
Discord_Client.login(DiscordKey);
Discord_Client.once(Events.ClientReady, (c) => {
//  console.log(`Saffbot alive.`);
});

const MESSAGELOGGER_DIR = './Messages_logger'
const Discord_Channel_Array = []


// reads the directory of "message logger" to check which csv files are present so if any are missing they may be added when a message in the missing channel is sent
fs.readdir(MESSAGELOGGER_DIR, (err, files) => { 
  if (err) 
    console.log(err); 
  else { 
    files.forEach(file => { 
      Discord_Channel_Array.push(file)
    }) 
  } 
})

const remove_linebreaks_ss = (str)=> {
  let newstr = "";
   
  // Looop and traverse string
  for (let i = 0; i < str.length; i++)
      if (!(str[i] == "\n" || str[i] == "\r"))
          newstr += str[i];
  return newstr
}

const delayExecution = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};
let i = 0
Discord_Client.on("messageCreate", async(message) => {
  // checks if message is part of a thread
  // checks if the message is a dm or not
  // checks if the dm is from a bot
  if(message.type == 18){return;}
  if(message.guildId == null){return}
  if(message.author.bot == true){return}

  // checks if the channel exists 
  let DisChannelId = message.channelId
  let found = false
  for(let i = 0; i!=Discord_Channel_Array.length; i++){
    if(DisChannelId+".csv" == Discord_Channel_Array[i]){
      found = true
      break;
    }
  }
  // if channel does not exist the correct csv file is created
  if(found == false){
    await fs.writeFileSync(`${MESSAGELOGGER_DIR}/${DisChannelId}.csv`, 'MessageId,AuthorName,CreatedTimeStamp,Reply,Attachment_url,Content,MentionedUsers,EditedTimeStamp,EditedAttachements,EditedContent,', (err) => {
      if (err)
        console.log(err); 
    })
    Discord_Channel_Array.push(`${DisChannelId}.csv`)
  }


  let Reply =''
  message_content = message
  // checks if whoever sent the message was a bot
  if(message.author.bot != true && message.guildId != null){
    // attachement urls
    let attachment_array = message.attachments.map((x) => JSON.stringify(x.url))
    let attachment_log = ''
    //checks if array exits has more items than 1
    if(attachment_array.length > 1){
      attachment_log = attachment_array.join('¬')
    } else if (attachment_array.length == 1){
      attachment_log = attachment_array[0]
    }

    //checks if the message is a reply to a user
    if (message.mentions.repliedUser != null) {
      Reply = `${message.mentions.repliedUser.username} $ ${message.mentions.repliedUser}`
    }
    // checks mentioned users in a message, for later replacement in Content
    let Mentions_username_array = []
    let Mentions_Id_array = []
    let mentionedUsers = ''
    if (message.mentions.users != null){
      Mentions_username_array = message.mentions.users.map((x) => JSON.stringify(x.username))
      Mentions_Id_array = message.mentions.users.map((x) => JSON.stringify(x.id))

      for(let i = 0; i < Mentions_username_array.length; i++){
        mentionedUsers = mentionedUsers + `${Mentions_username_array[i].split('"')[1]}$${Mentions_Id_array[i].split('"')[1]} ¬ `
      }
    }
    
    
    
    // input sanitization
    // commas break csv files since "comma seperated"
    let MessageContent = message.content.split(',')
    MessageContent = MessageContent.join(' ')
    // single quote breaks csv files so just going to remove them all
    MessageContent = message.content.split('"')
    MessageContent = MessageContent.join(' ')
    // line breaks also break csv files need to remove them
    MessageContent = remove_linebreaks_ss(MessageContent)

    // saves message to csv file of the channel where it was sent
    await fs.appendFile(`${MESSAGELOGGER_DIR}/${DisChannelId}.csv`,`\n${message.id},${message.author.username},${message.createdTimestamp},${Reply},${attachment_log},${MessageContent},${mentionedUsers},,,,`, (err) =>{
      if(err){
        console.log(err)
      }else{
      }
    })
  
    const results = [];
    let outgoing_log = ''
    // read the last line in a csv file to be saved to be outputed in later into a log discord channel
    console.log(i)
    i++
    fs.createReadStream(`${MESSAGELOGGER_DIR}/${DisChannelId}.csv`)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {

      let csv_messageid = results[results.length-1].MessageId
      let csv_authorName = results[results.length-1].AuthorName
      let csv_createdTimeStamp = results[results.length-1].CreatedTimeStamp
      let csv_Reply = results[results.length-1].Reply
      let csv_Attachment_url = results[results.length-1].Attachment_url
      let csv_Content = results[results.length-1].Content
      let csv_Mentioned_users = results[results.length-1].MentionedUsers
      delayExecution(2000)

      // if there is no attachments the url is set to none 
      if (csv_Attachment_url == ''){
        csv_Attachment_url = 'No Attachements'
      }
      // if the message is a reply the username of the person being replied to is added on to the message
      if (csv_Reply != ''){
        csv_Reply_split = csv_Reply.split('$');
        csv_Reply = csv_Reply_split[0]
      }
      

      // mentioned user output, splits  csv entry of mentuoned users at ¬
      // then futher splits it at the $
      let mentioned_users_array = csv_Mentioned_users.split(' ¬ ')
      let mentioned_users_array_split = []
      for(let i = 0; i<mentioned_users_array.length-1; i++){
        mentioned_users_array_split.push(mentioned_users_array[i].split('$'))
      }
      // replaces the mention in a message with the user name of the person mentioned
      for(let i = 0; i < mentioned_users_array_split.length; i++){
        csv_Content = csv_Content.replace(`<@${mentioned_users_array_split[i][1]}>`, `${mentioned_users_array_split[i][0]}`)
      }
      // fixes time stamp 
      let OutputTimestamp = Math.round(csv_createdTimeStamp/1000)
      outgoing_log = ' <t:' + OutputTimestamp + ':d> | ' + "< https://discord.com/channels/"+message.guildId+"/"+message.channelId + ' >: | ' + csv_authorName + ': < ' + csv_Attachment_url + ' >: ' + csv_Content + ' | Reply: ' + csv_Reply
      
      // due to api limits saffbot can only post messages 2000 characters long
      // so if messages is long then 2000, then characters are removed from the content of the messages untill it reaches 2000 characters
      if(outgoing_log.length > 2000){
        let OverLimit = outgoing_log.length - 2000

        csv_Content = csv_Content.substring(0, (csv_Content.length - OverLimit)- 100)
        csv_Content = csv_Content + ' Message'
        outgoing_log = ' <t:' + OutputTimestamp + ':d> | ' + "< https://discord.com/channels/"+message.guildId+"/"+message.channelId + ' >: | ' + csv_authorName + ': < ' + csv_Attachment_url + ' >: ' + csv_Content + ' | Reply: ' + csv_Reply
        // if the messages is still longer then 2000 characters "Message Too long to be sent in discord" is sent, last resort in case of length
        if(outgoing_log.length > 2000){ outgoing_log = ' <t:' + OutputTimestamp + ':d> Message is too long to be sent in discord'}
      }

      // list of discord channels
      // 1186681602361798767 messages
      // 1198380107409145906 bot playground
      // 1186684858139955241 test 2
      const channel = Discord_Client.channels.cache.get("1198380107409145906");
      if(outgoing_log != ''){
        console.log(outgoing_log)
        channel.send(outgoing_log)
      }

    });
  }
  console.log(message)
})

// message update, updates csv file of message id to save when a message has been updated
// new folder with message ids, and what there were updated to?
// to be done later, not a current problem

Discord_Client.on('messageUpdate', (oldMessage, newMessage) => {
//  console.log(oldMessage, newMessage)
  let channelId_check = ''
  if(oldMessage.channelId == newMessage.channelId){channelId_check = oldMessage.channelId;}
  let results = []
  let message_id_location = 0
  fs.createReadStream(`${MESSAGELOGGER_DIR}/${channelId_check}.csv`)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('error', (err) => console.log(err))
    .on('end', () => {
      delayExecution(200)
      for(let i = 0; i < results.length; i++ ){
        let csv_messageid = results[i].MessageId
        if(csv_messageid == newMessage.id){
          message_id_location = i
        }
      }
    })
})

// Mod mail, dm saffbot creates thread in complaints channel when responded a reply is sent in the dms
let ComplaintId = 0
fs.readFileSync('ComplaintIdNum.txt', 'utf8', function(err, data){
  if(err){
    console.log(err)
  }
  ComplaintId = data
});
let ReasonForComplaint = ''
Discord_Client.on("messageCreate", async message => {
  if (message.author.bot == true){return}
  if (message.guildId != null){return}
  const Complaintschannel = Discord_Client.channels.cache.get("1198380107409145906");
  const thread =  await Complaintschannel.threads.create({
    name: `Complaint Id: ${ComplaintId}`,
  });
  thread.send(message.content)
  console.log(`Created thread: ${thread.name}`);
  ComplaintId++
  fs.writeFileSync('ComplaintIdNum.txt', `${ComplaintId}`);
});



// shill messages
// can be updated by mods with !shill "(new thing to shill about)"

// Youtube announcements
// reads database off mongo, for youtube api keys, then checks if there is a live stream, if yes posts stream url with @stream alerts

// twitch announcements
// i need to do reasearch

// Twitter Logs of saff
// Twitter, art # logger

// checks if discord users has youtube account attached, then checks if they are paying saff money to give out role
// once a day