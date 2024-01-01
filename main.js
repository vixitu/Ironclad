const dotenv = require("dotenv");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { MongoClient } = require('mongodb');

dotenv.config();
const TOKEN = process.env.TOKEN;
const DATABASETOKEN = process.env.DATABASETOKEN;

const CLIENT_ID = "1148304823989575840";
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const dbClient = new MongoClient(DATABASETOKEN, { useNewUrlParser: true, useUnifiedTopology: true });
module.exports = { dbClient };


client.commands = new Collection();

let commands = [];

const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"));
for (const file of slashFiles) {
    const slashcmd = require(`./slash/${file}`);
    client.commands.set(slashcmd.data.name, slashcmd);
    commands.push(slashcmd.data.toJSON());
}

(async () => {
    try {
        await dbClient.connect();
        console.log('Connected to MongoDB');

        // Now you can perform database operations using "dbClient.db('databaseName')"

        // Example: Insert a document into a collection
        const db = dbClient.db('PanzerDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
})();

client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);
    // Retrieve all guilds the bot is in
    const guilds = client.guilds.cache;
    

    // Loop through each guild and create a collection if it doesn't exist
    for (const guild of guilds.values()) {
        console.log(guild.id);
        const serverDB = dbClient.db("PanzerDB");
        const collectionName = `reservedCountries_${guild.id}`;
        const hostInfoCollectionName = `hostInfo_${guild.id}`;
        const configCollection = serverDB.collection(`configInfo`)

        try {
            const collectionExists = await serverDB
                .listCollections({ name: collectionName })
                .hasNext();

            if (!collectionExists) {
                // If the collection doesn't exist, create it
                await serverDB.createCollection(collectionName);
                console.log(`Collection '${collectionName}' created for server ${guild.name}`);
            } else {
                console.log("All collections exist!");
            }

            // Check if the hostInfo collection exists
            const hostInfoCollectionExists = await serverDB
                .listCollections({ name: hostInfoCollectionName })
                .hasNext();

            // Create the hostInfo collection if it doesn't exist
            if (!hostInfoCollectionExists) {
                await serverDB.createCollection(hostInfoCollectionName);
                console.log(`Collection '${hostInfoCollectionName}' created for server ${guild.name}`);
            }

            const configCollectionExists = await configCollection.findOne({serverID: guild.id})

            if (!configCollectionExists){
                await configCollection.insertOne({
                    serverID: guild.id
                })
                console.log('New config document added!')
            }
        } catch (err) {
            console.error(err);
        }
    }

    const rest = new REST({ version: "9" }).setToken(TOKEN);

    // Fetch all the guilds the bot is in
    console.log('guilds ' + guilds)
    // Loop through each guild and deploy slash commands
    for (const guild of guilds.values()) {
        const guildID = guild.id;
        const guildCommands = commands.map((command) => ({
            ...command,
            guildId: guildID,
        }));
    
        try {
            console.log(`Deploying slash commands for server ${guild.name}`);
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildID), {
                body: guildCommands,
            });
    
            console.log(`Successfully deployed slash commands for server ${guild.name}`);
        } catch (err) {
            console.error(`Error deploying slash commands for server ${guild.name}:`, err);
        }
    }
    
    console.log("Successfully loaded");

});

client.on("interactionCreate", (interaction) => {
    async function handleCommand() {
        if (!interaction.isCommand()) return;

        const slashcmd = client.commands.get(interaction.commandName);
        if (!slashcmd) interaction.reply("Not a valid slash command");

        await interaction.deferReply();
        await slashcmd.run({ client, interaction });
    }
    handleCommand();
});


client.login(TOKEN);
require('./dashboard/server')
module.exports = client;
console.log("LOGGED IN!")