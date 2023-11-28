require("dotenv").config();
let DiscordKey = process.env.DiscordApiKey;
const {
  Client,
  GatewayIntentBits,
  Message,
  Events,
  Guild,
  GuildMember
} = require("discord.js");
const Discord_Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
});
Discord_Client.login(DiscordKey);
Discord_Client.once(Events.ClientReady, (c) => {
  console.log(`Saffbot alive.`);
});

Discord_Client.on('messageCreate', message => {
    Hasrole = message.member.roles.cache.map(role => role.name).join(", ")
    console.log(Hasrole)
    if(message.content == '!shill' && Hasrole.includes('Ducal Vassal') == true || message.content == '!shill' && Hasrole.includes('Eggpress Saffron') == true || message.content == '!shill' && message.author.globalName == 'snipzer789'  ){
      const channel = Discord_Client.channels.cache.get(message.channelId);
      channel.send('if youre considering buying the new dlc, make sure to do it through this link. it tells pdx im worth sponsoring and hopefully ensures it happens again \n https://play.europauniversalis.com/LadySaffron')
    }
})

