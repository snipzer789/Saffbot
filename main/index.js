// gotta keep those apikeys secret
require('dotenv').config()
let DiscordKey = process.env.DiscordApiKey
let uri = process.env.uri


// module imports that are required
const axios = require('axios')
const date = require('date-and-time')
const fs = require('node:fs')
const http = require('node:http')
const { Client, GatewayIntentBits, Message, Events, Guild } = require('discord.js')
const { MongoClient, ServerApiVersion, Collection } = require('mongodb');
const { check } = require('./timecheck.js')

// variable init 
const YoutubeUrlApicall = 'https://www.googleapis.com/youtube/v3'

// test id UCXuqSBlHAE6Xw-yeJA0Tunw
// saff id UC4c7omgQTXLLZWfG1glBamg

// mongodb
const MongoDb_Client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true,}
});

//                            str int         int     str           str       str             str                 str           str
async function UpdateDataToDB(DB, UsageCount, Price, YoutubeapiKey, GuildId, DiscordChannel, YoutubeChannelId, LastStreams , DiscordUpdateType) {
  try {
    let temp = []

    // Connect the client to the server`
    await MongoDb_Client.connect();
    // Send a ping to confirm a successful connection
    await MongoDb_Client.db("admin").command({ ping: 1 });
    console.log("Db connected");
    
    const Database = MongoDb_Client.db("saffbot");
    const Collection = Database.collection(DB)
      

    if( DB == 'YoutubeApiInfo'){
    
      temp.push(UsageCount)
      temp = temp.map(Number)
      let newUsage = temp[0]+Price

      await Collection.updateOne({YoutubeApiKey:`${YoutubeapiKey}`}, { $set: { UsageCount: newUsage }})
    }
    if(DB == 'discordChannels' && DiscordUpdateType == 'Guild id'){
      console.log('Insert guild')
      await Collection.insertOne({DiscordChannelId:'', YoutubeId:'', LastStream:'', DiscordGuildId:`${GuildId}`})
    }
    if(DB == 'discordChannels' && DiscordUpdateType == 'Channel id'){
      console.log('updateChannel')
      await Collection.updateOne({DiscordGuildId:`${GuildId}`}, {$set:  {DiscordChannelId:`${DiscordChannel}`}})
    }

  } finally {
    // Ensures that the client will close when you finish/error       
    await MongoDb_Client.close();
  }
}


async function LoadDataFromDB(DB) {
  try {
      
    let array = []
    // Connect the client to the server`
    await MongoDb_Client.connect();
    // Send a ping to confirm a successful connection
    await MongoDb_Client.db("admin").command({ ping: 1 });
    console.log("Db connected");


    const Database = MongoDb_Client.db("saffbot");
    const Collection = Database.collection(DB)
      
    if(DB == 'YoutubeApiInfo'){
      const cursor = await Collection.findOne({ UsageCount: { $lt: 10000} });
      array.push(cursor.YoutubeApiKey, cursor.ApiName, cursor.UsageCount)
      return array
    }

    if (DB == 'discordChannel'){
      const cursor = DiscordChannels.find()
      for await (const doc of cursor) {
        array.push(doc.DiscordChannelId,doc.guildId, doc.YoutubeId, doc.LastStream)
      }
      return array
    }

  } finally {
    // Ensures that the client will close when you finish/error
    await MongoDb_Client.close();
  }
}



// discordapi setup
const Discord_Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages]
});

Discord_Client.login(DiscordKey)

Discord_Client.once(Events.ClientReady, c => {
    console.log(`Saffbot alive.`)
})


Discord_Client.on('messageCreate', message => {
  if(message.content == '!setchannel'){
    message.reply('channel saved')
    let tempMessage = (message.content).split(' ')
    console.log(tempmessage)
    let channelId = message.channelId
    let guildId = message.guildId
    console.log(channelId)
    console.log(guildId)
    //find youtube channel id
    let YoutubeChannelId = ''

    UpdateDataToDB('discordChannels', 0, 0, '', guildId, channelId, YoutubeChannelId, '', 'Channel id')
  }
})

Discord_Client.on("guildCreate", message => {
  console.log('Discord Server Joined')
  let guildId = message.guildId
  //                str           int int str             str str str
  UpdateDataToDB('discordChannels', 0, 0, '', guildId, '','','', 'Guild id')
} )


// Live Checking,
const Live = async() => {
    try {

        let price = 100
        // parsing youtube api keys
        const YoutubeApiInUse = await LoadDataFromDB('')
        // discord channel id parsing
        const discordChannel = await LoadDataFromDB('')
        // youtube api searching
        const response = await axios.get(`${YoutubeUrlApicall}/search?part=snippet&channelId=${discordChannel[1]}&channelType=any&eventType=live&order=relevance&safeSearch=safeSearchSettingUnspecified&type=video&key=${YoutubeApiInUse[0]}`)
        let streamurl = response.data.items.map((item) => item.id.videoId)

        console.log('youtube api Used')

        // update usage count

        // saves the url so it doesnt multipost the same stream
        let LastStreamUrl = fs.readFileSync('../LastStreamUrl.txt', { encoding: 'utf8', flag: 'r' })
        if(streamurl != '' && LastStreamUrl != streamurl){
            // discord channel the announcement is send in
            const channel = Discord_Client.channels.cache.get(discordChannel[0]);
            channel.send(`<@&1093184251979112539> Saff is now live: https://www.youtube.com/watch?v=${streamurl}`);

            console.log('Live status posted')
            fs.writeFileSync('../LastStreamUrl.txt', `${streamurl}`)
        }


    } catch (err) {
        console.log(err)
    }
}


const delayExecution = (ms) => {
    return new Promise((resolve, reject) => {
              setTimeout(() => {
            resolve()
        }, ms)
    })
}

const loop = async () => {
  await delayExecution(2000)
  while (true) {
    await delayExecution(1000)
    let current_mins = date.format(new Date, 'mm')
    let response = check(current_mins)

    if (response == 1){
        console.log('checked')
    }
  }
}

loop()