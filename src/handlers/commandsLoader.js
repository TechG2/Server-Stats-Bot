const path = require("node:path");
const { REST, Routes, Collection } = require("discord.js");
const getFiles = require("../utils/getFiles");
require("dotenv").config();

const token = process.env.TOKEN;
const clientID = process.env.CLIENT_ID;

module.exports = (client) => {
  client.commands = new Collection();

  const commands = [];
  const commandFiles = getFiles(path.join(__dirname, "..", "commands")).filter(
    (file) => file.endsWith(".js")
  );

  console.log("Loaded commands:");

  for (const file of commandFiles) {
    const command = require(file);

    const commandJson = command.data.toJSON();
    commands.push(commandJson);
    client.commands.set(command.data.name, command);
    console.log(`${command.data.name} ✅`);
  }

  const rest = new REST({ version: "10" }).setToken(token);

  (async () => {
    try {
      await rest.put(Routes.applicationCommands(clientID), {
        body: commands,
      });
    } catch (error) {
      console.error(error);
    }
  })();
};
