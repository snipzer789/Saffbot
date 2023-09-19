// gotta keep those apikeys secret
require('dotenv').config()
let DiscordKey = process.env.DiscordApiKey

// module imports that are required
const axios = require('axios')
const date = require('date-and-time')
const fs = require('node:fs')
const http = require('node:http')
const { Client, GatewayIntentBits, Message, Events } = require('discord.js')

// variable init 
const youtubeApiUsagePricing = [100]
const YoutubeUrlApicall = 'https://www.googleapis.com/youtube/v3'
const ChannelId = 'UCXuqSBlHAE6Xw-yeJA0Tunw'
// test id UCXuqSBlHAE6Xw-yeJA0Tunw
// saff id UC4c7omgQTXLLZWfG1glBamg

// discordapi setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages]
});

client.login("MTE0ODk4NzY2Nzk4ODYyNzQ5Ng.GVj3f7.9NkeajWUoVlvTd7jP9gECjplMhR1tCvyTOjOvQ")

client.once(Events.ClientReady, c => {
    console.log(`Saffbot alive.`)
})

// checking api usage count
const ApiParsing = () => {
    const YoutubeApiInfojson = JSON.parse(fs.readFileSync('./YoutubeApiInfo.json', { encoding: 'utf8'}))
    const youtubeApiKeys = YoutubeApiInfojson.YoutubeApiKeys
    const youtubeApiUsage = YoutubeApiInfojson.youtubeUsageCounts

    console.log('--------------')
    //checks for an api which does not have maximum usage count
    for(let i = 0; i != 3; i++){
        if(youtubeApiUsage[i] != '10000'){
            console.log(`Api usage count: ${youtubeApiUsage[i]}`)
            console.log('--------------')
            return (youtubeApiKeys[i]).split('¬')
        }
    }
}
 
    const YoutubeCountUpdate = (youtubeApiKeys, PricingCount) => {
    const YoutubeApiInfoJson = fs.readFileSync('./YoutubeApiInfo.json', {encoding: 'utf8'})
    let oldUsageCount = YoutubeApiInfoJson.youtubeUsageCountsvs[youtubeApiKeys[2]]
    console.log(YoutubeApiInfoJson)



    fs.writeFileSync('./test.json', `hello world`)
    console.log("updated successfully.");

}

// Live Checking,
const Live = async() => {
    try {

        // parsing youtube api keys
        const YoutubeApiInUse = ApiParsing()
        // discord channel id parsing
        const discordChannelId = JSON.parse(fs.readFileSync('./DiscordInfo.json', {encoding: 'utf-8'}))
        // youtube api searching
        const response = await axios.get(`${YoutubeUrlApicall}/search?part=snippet&channelId=${ChannelId}&channelType=any&eventType=live&order=relevance&safeSearch=safeSearchSettingUnspecified&type=video&key=${YoutubeApiInUse[1]}`)
        let streamurl = response.data.items.map((item) => item.id.videoId)

        console.log('youtube api Used')

        // update usage count
        YoutubeCountUpdate(YoutubeApiInUse, youtubeApiUsagePricing[0])

        // saves the url so it doesnt multipost the same stream
        let LastStreamUrl = fs.readFileSync('../LastStreamUrl.txt', { encoding: 'utf8', flag: 'r' })

        if(streamurl != '' && LastStreamUrl != streamurl){
            // discord channel the announcement is send in
            const channel = client.channels.cache.get(discordChannelId.DiscordChannelId[0]);
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
        Live()
    }
}


loop()
