// gotta keep those apikeys secret
require("dotenv").config();
let DiscordKey = process.env.DiscordApiKey;
let uri = process.env.uri;

// module imports that are required
const axios = require("axios");
const date = require("date-and-time");
const fs = require("node:fs");
const http = require("node:http");
const {
  Client,
  GatewayIntentBits,
  Message,
  Events,
  Guild,
} = require("discord.js");
const {
  MongoClient,
  ServerApiVersion,
  Collection,
  StreamDescription,
} = require("mongodb");
const { check } = require("./timecheck.js");

// variable init
const YoutubeUrlApicall = "https://www.googleapis.com/youtube/v3";

// test id UCSJ4gkVC6NrvII8umztf0Ow
// saff id UC4c7omgQTXLLZWfG1glBamg

// mongodb
const MongoDb_Client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//                            str int         int     str           str       str             str                 str           str
async function UpdateDataToDB(
  DB,
  UsageCount,
  Price,
  YoutubeapiKey,
  GuildId,
  DiscordChannel,
  YoutubeChannelId,
  LastStreams,
  DiscordUpdateType
) {
  try {
    let temp = [];

    // Connect the client to the server`
    await MongoDb_Client.connect();
    // Send a ping to confirm a successful connection
    await MongoDb_Client.db("admin").command({ ping: 1 });
    console.log("Updating Data to Db");

    const Database = MongoDb_Client.db("saffbot");
    const Collection = Database.collection(DB);

    if (DB == "YoutubeApiInfo") {
      let newUsage = UsageCount + Price;
      console.log(newUsage);
      await Collection.updateOne(
        { YoutubeApiKey: `${YoutubeapiKey}` },
        { $set: { UsageCount: newUsage } }
      );
    }
    if (DB == "discordChannels" && DiscordUpdateType == "Guild id") {
      console.log("Insertguild");
      await Collection.insertOne({
        DiscordChannelId: "",
        YoutubeId: "",
        LastStream: "",
        DiscordGuildId: `${GuildId}`,
      });
    }
    //if(DB == 'discordChannels' && DiscordUpdateType == 'Channel id'){
    //  console.log('updateChannel')
    //  await Collection.updateOne({DiscordGuildId:`${GuildId}`}, {$set:  {DiscordChannelId:`${DiscordChannel}`}})
    //}
    //if(DB == 'discordChannels' && DiscordUpdateType == 'Youtube id'){
    //  console.log('updateYoutube')
    //  await Collection.updateOne({DiscordGuildId:`${GuildId}`}, {$set:  {YoutubeId:`${YoutubeChannelId}`}})
    //}
    if (Price == -100) {
      await Collection.updateMany(
        { UsageCount: { $gt: 0 } },
        { $set: { UsageCount: 0 } }
      );
    }
  } catch (err) {
    console.log(err);
  } finally {
    // Ensures that the client will close when you finish/error
    await MongoDb_Client.close();
  }
}

async function LoadDataFromDB(DB) {
  try {
    let array = [];
    // Connect the client to the server`
    await MongoDb_Client.connect();
    // Send a ping to confirm a successful connection
    await MongoDb_Client.db("admin").command({ ping: 1 });
    console.log("Loading Data from Db");

    const Database = MongoDb_Client.db("saffbot");
    const Collection = Database.collection(DB);

    if (DB == "YoutubeApiInfo") {
      const cursor = await Collection.findOne({ UsageCount: { $lt: 10000 } });

      array.push(cursor.YoutubeApiKey, cursor.ApiName, cursor.UsageCount);
      return array;
    }

    if (DB == "discordChannels") {
      const cursor = Collection.findOne();
      array.push(
        cursor.DiscordChannelId,
        cursor.guildId,
        cursor.YoutubeId,
        cursor.LastStream
      );
      console.log(array);
      return array;
    }
  } catch (err) {
    console.log(err);
  } finally {
    // Ensures that the client will close when you finish/error
    await MongoDb_Client.close();
  }
}

const YoutubeChannelIds = async (YoutubeChannelUrl) => {
  try {
    let YoutubeApiInuse = await LoadDataFromDB("YoutubeApiInfo");

    const response = await axios.get(
      `${YoutubeUrlApicall}/search?part=id,snippet&maxResults=1&type=channel&q=${YoutubeChannelUrl}&key=${YoutubeApiInuse[0]}`
    );

    let YoutubeChannelId = response.data.items.map((item) => item.id.channelId);

    console.log(YoutubeChannelId[0]);
    return YoutubeChannelId[0];
  } catch (err) {
    console.log(err);
  }
};

// Live Checking,
const Live = async () => {
  try {
    console.log(
      "------------------------------------------------------------------------------------------"
    );
    // parsing youtube api keys
    const YoutubeApiInUse = await LoadDataFromDB("YoutubeApiInfo");
    // discord channel id parsing
    //const discordChannel = await LoadDataFromDB('discordChannels')
    //console.log(discordChannel)
    // youtube api searching
    const response = await axios.get(
      `${YoutubeUrlApicall}/search?part=snippet&channelId=UC4c7omgQTXLLZWfG1glBamg&channelType=any&eventType=live&order=relevance&safeSearch=safeSearchSettingUnspecified&type=video&key=${YoutubeApiInUse[0]}`
    );
    let streamurl = response.data.items.map((item) => item.id.videoId);
    let UsageCount = YoutubeApiInUse[2];
    // update usage count
    await UpdateDataToDB(
      "YoutubeApiInfo",
      UsageCount,
      100,
      YoutubeApiInUse[0],
      "",
      "",
      "",
      "",
      "",
      ""
    );
    console.log(
      "------------------------------------------------------------------------------------------"
    );

    console.log("youtube api Used");
    console.log(streamurl.join(""));
    streamurl = streamurl.join("");
    console.log(
      "------------------------------------------------------------------------------------------"
    );
    if (streamurl == "") {
      console.log("No stream");
    }

    // saves the url so it doesnt multipost the same stream
    let LastStreamUrl = fs.readFileSync("./LastStreamUrl.txt", {
      encoding: "utf8",
      flag: "r",
    });
    if (streamurl != "" && LastStreamUrl != streamurl) {
      // discord channel the announcement is send in
      // 1146490102424555552
      const channel = Discord_Client.channels.cache.get("1080156472488497253");
      channel.send(
        `<@&1093184251979112539> Saff is now live: https://www.youtube.com/watch?v=${streamurl}`
      );

      console.log("Live status posted");
      fs.writeFileSync("./LastStreamUrl.txt", `${streamurl}`);
    }

    console.log(
      "------------------------------------------------------------------------------------------"
    );
  } catch (err) {
    console.log(err);
  }
};

// discordapi setup
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
  console.log(`Saffbot alive.`);
});

/*Discord_Client.on('messageCreate', message => {
  let tempMessage = (message.content).split(' ')
  if(tempMessage[0] == '!setchannel'){
    message.reply('channel saved')

    let channelId = message.channelId
    let guildId = message.guildId

    //find youtube channel id
    UpdateDataToDB('discordChannels', 0, 0, '', guildId, channelId, '', '', 'Channel id')
  }
})*/

Discord_Client.on("guildCreate", (message) => {
  console.log("Discord Server Joined");
  let guildId = message.guildId;
  //                str           int int str             str str str
  UpdateDataToDB("discordChannels", 0, 0, "", guildId, "", "", "", "Guild id");
});

const delayExecution = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

let count = 0;

const loop = async () => {
  await delayExecution(2000);
  while (true) {
    await delayExecution(4000);
    let current_mins = date.format(new Date(), "mm");
    let current_Hour = date.format(new Date(), "hh");
    let current_Time = date.format(new Date(), "A");
    let response = check(current_mins);
    if (response == 1) {
      console.log("checked");
      await Live();
    }
    console.log(date.format(new Date(), "ddd, MMM DD YYYY hh:mm A [GMT]Z"));

    if (current_Time == "AM") {
      if (current_Hour == "08" && count < 10) {
        await UpdateDataToDB("YoutubeApiInfo", 0, -100, "", "", "", "", "", "");
        console.log("reset usagecount");
        count++;
      }
    }
    if ((current_Hour == "08") & (count == 10)) {
      count = 0;
    }
  }
};

loop();
