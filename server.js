const {Client, GatewayIntentBits, Message, Events, Guild} = require("discord.js");
const DATE = require('date-and-time')
const fs = require('node:fs');
const csv = require('csv-parser')
require("dotenv").config();
// MTE0ODk4NzY2Nzk4ODYyNzQ5Ng.GArg_b.aASrSlY349sTAfVF-n2LattguQPym-tPLloyPA
// MTEzNjgwOTAwODQ0ODE2Mzk1Mg.G5pdmA.fHWDcVp-jOpwA0N0_RA_f_Oh8hvsT1wmBVn__I
let DiscordKey = process.env.DiscordTolken;

const Discord_Client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.DirectMessages,
    ],
});
Discord_Client.login(DiscordKey);
Discord_Client.once(Events.ClientReady, (c) => {
//  console.log(`Saffbot alive.`);
});

const MESSAGELOGGER_DIR = './Messages_logger'
const Discord_Channel_Array = []

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

Discord_Client.on("messageCreate", (message) => {
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
    fs.writeFileSync(`${MESSAGELOGGER_DIR}/${DisChannelId}.csv`, 'MessageId,AuthorName,CreatedTimeStamp,Reply,Attachment_url,Content,MentionedUsers,EditedTimeStamp,EditedAttachements,EditedContent', (err) => {
      if (err)
        console.log(err); 
      else {
        Discord_Channel_Array.push(`${DisChannelId}.csv`)
      }
    })
  }


  let Reply =''
  message_content = message
  // checks if whoever sent the message was a bot
  if(message.author.bot != true){

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
    let MessageContent = message.content.split(',')
    MessageContent = MessageContent.join(' ')
    MessageContent = remove_linebreaks_ss(MessageContent)

    // saves message to csv file of the channel where it was sent
    fs.appendFile(`${MESSAGELOGGER_DIR}/${DisChannelId}.csv`,`\n${message.id},${message.author.username},${message.createdTimestamp},${Reply},${attachment_log},${MessageContent},${mentionedUsers},,,,`, (err) =>{
      if(err){
        console.log(err)
      }else{
      }
    })
  
  const results = [];
  let outgoing_log = ''

  fs.createReadStream(`${MESSAGELOGGER_DIR}/${message.channelId}.csv`)
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
      if (csv_Attachment_url == ''){
        csv_Attachment_url = 'No Attachements'
      }
      if (csv_Reply != ''){
        csv_Reply_split = csv_Reply.split('$');
        csv_Reply = csv_Reply_split[0]
      }
      

      let mentioned_users_array = csv_Mentioned_users.split(' ¬ ')
      let mentioned_users_array_split = []
      for(let i = 0; i<mentioned_users_array.length-1; i++){
        mentioned_users_array_split.push(mentioned_users_array[i].split('$'))
      }
      
      for(let i = 0; i < mentioned_users_array_split.length; i++){
        csv_Content = csv_Content.replace(`<@${mentioned_users_array_split[i][1]}>`, `${mentioned_users_array_split[i][0]}`)
      }
      let OutputTimestamp = Math.round(csv_createdTimeStamp/1000)
      outgoing_log = ' <t:' + OutputTimestamp + ':d> | ' + "< https://discord.com/channels/"+message.guildId+"/"+message.channelId + ' >: | ' + csv_authorName + ': < ' + csv_Attachment_url + ' > : ' + csv_Content + ' | Reply: ' + csv_Reply
      if(outgoing_log.length > 2000){
        let OverLimit = outgoing_log.length - 2000

        csv_Content = csv_Content.substring(0, (csv_Content.length - OverLimit)- 100)
        csv_Content = csv_Content + ' Message'
        outgoing_log = ' <t:' + OutputTimestamp + ':d> | ' + "< https://discord.com/channels/"+message.guildId+"/"+message.channelId + ' >: | ' + csv_authorName + ': < ' + csv_Attachment_url + ' > : ' + csv_Content + ' | Reply: ' + csv_Reply
      }

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
})
