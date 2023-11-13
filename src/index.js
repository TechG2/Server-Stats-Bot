const { Client, GatewayIntentBits } = require("discord.js");
const eventsHandler = require("./handlers/eventsHandler.js");
const commandsLoader = require("./handlers/commandsLoader.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

eventsHandler(client);
commandsLoader(client);

client.login(process.env.TOKEN);
