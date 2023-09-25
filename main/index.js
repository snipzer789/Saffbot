// gotta keep those apikeys secret
require('dotenv').config()
let DiscordKey = process.env.DiscordApiKey
let uri = process.env.uri


// module imports that are required
const axios = require('axios')
const date = require('date-and-time')
const fs = require('node:fs')
const http = require('node:http')
const { Client, GatewayIntentBits, Message, Events } = require('discord.js')
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

async function LoadYoutubeApiDB(price) {
    try {
      
      let array = []
      let temp = []
      // Connect the client to the server
      await MongoDb_Client.connect();
      // Send a ping to confirm a successful connection
      await MongoDb_Client.db("admin").command({ ping: 1 });
      console.log("Db connected");


      const Database = MongoDb_Client.db("saffbot");
      const YoutubeApiInfo = Database.collection("YoutubeApiInfo")
        
      const cursor = await YoutubeApiInfo.findOne({ UsageCount: { $lt: 10000} });
      
      temp.push(cursor.UsageCount)
      temp = temp.map(Number)
      let newUsage = temp[0]+price
      console.log(newUsage)

      await YoutubeApiInfo.updateOne({YoutubeApiKey:`${cursor.YoutubeApiKey}`}, { $set: { UsageCount: newUsage }})
      // Print a message if no documents were found
  
      // Print returned documents
      array.push(cursor.YoutubeApiKey, cursor.ApiName, cursor.UsageCount)



      return array
    } finally {
      // Ensures that the client will close when you finish/error
      await MongoDb_Client.close();
    }
}
async function UpdateYoutubeApiUsage(newUsage, YoutubeApiInfoold) {
    try {
      // Connect the client to the server
      await MongoDb_Client.connect();
      // Send a ping to confirm a successful connection
      await MongoDb_Client.db("admin").command({ ping: 1 });
      console.log("Db connected");

      const Database = MongoDb_Client.db("saffbot");
      const YoutubeApiInfo = Database.collection("YoutubeApiInfo")
      console.log(newUsage)
      await YoutubeApiInfo.updateOne({YoutubeApiKey:`${YoutubeApiInfoold[0]}`}, { $set: { UsageCount: `${newUsage}` }})

    } finally {
      // Ensures that the client will close when you finish/error
      await MongoDb_Client.close();
    }
}

async function LoadDiscordDB() {
    try {
        
        let array = []

        // Connect the client to the server
        await MongoDb_Client.connect();
        // Send a ping to confirm a successful connection
        await MongoDb_Client.db("admin").command({ ping: 1 });
        console.log("Db connected");
        const Database = MongoDb_Client.db("saffbot");
        const DiscordChannels = Database.collection("discordChannels")
        const cursor = DiscordChannels.find()
        // Print a message if no documents were found
        if ((await DiscordChannels.countDocuments()) === 0) {
          console.log("No documents found!");
        }
    
        // Print returned documents
        for await (const doc of cursor) {
          array.push(doc.DiscordChannelId, doc.YoutubeId, doc.LastStreamUrl)
      }
        return array
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

Discord_Client.login("MTE0ODk4NzY2Nzk4ODYyNzQ5Ng.GVj3f7.9NkeajWUoVlvTd7jP9gECjplMhR1tCvyTOjOvQ")

Discord_Client.once(Events.ClientReady, c => {
    console.log(`Saffbot alive.`)
})

// Live Checking,
const Live = async() => {
    try {

        let price = 100
        // parsing youtube api keys
        const YoutubeApiInUse = await LoadYoutubeApiDB(price)
        // discord channel id parsing
        const discordChannel = await LoadDiscordDB()
        // youtube api searching
        const response = await axios.get(`${YoutubeUrlApicall}/search?part=snippet&channelId=${discordChannel[1]}&channelType=any&eventType=live&order=relevance&safeSearch=safeSearchSettingUnspecified&type=video&key=${YoutubeApiInUse[0]}`)
        let streamurl = response.data.items.map((item) => item.id.videoId)

        console.log('youtube api Used')


        //UpdateYoutubeApiUsage(newUsage, YoutubeApiInUse)


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