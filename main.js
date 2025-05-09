const dotenv = require("dotenv");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const {
  Client,
  GatewayIntentBits,
  Collection,
  ActivityType,
} = require("discord.js");
const { MongoClient } = require("mongodb");
const { Player, QueryType, useMainPlayer } = require("discord-player");
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { YoutubeExtractor } = require("@discord-player/extractor");
const { YoutubeiExtractor } = require("discord-player-youtubei");

const { initModels, Song } = require("./initModels");
const sequelize = require("./database");

dotenv.config();
const TOKEN = process.env.TOKEN;
const DATABASETOKEN = process.env.DATABASETOKEN;

const CLIENT_ID = "1148304823989575840";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 8000;
server.listen(PORT, () =>
  console.log("EXPRESS: server online on PORT " + PORT)
);

const dbClient = new MongoClient(DATABASETOKEN);
module.exports = { dbClient };

client.commands = new Collection();

let commands = [];

const slashFiles = fs
  .readdirSync("./slash")
  .filter((file) => file.endsWith(".js"));
for (const file of slashFiles) {
  const slashcmd = require(`./slash/${file}`);
  client.commands.set(slashcmd.data.name, slashcmd);
  commands.push(slashcmd.data.toJSON());
}

io.on("connection", (socket) => {
  console.log("BOT: a user connnected");
  socket.on("getQueue", (id, callback) => {
    console.log("RECEIVED REQUEST TO GET QUEUE FROM SERVER: " + id);
    const guild = client.guilds.cache.get(id);
    const queue = client.player.nodes.get(guild);
    if (!queue) {
      console.log("There isn't even anything playing you scizophrenic mfer.");
      return;
    }
    const tracks = queue.node.queue.tracks.store;
    callback({
      status: "ok",
      queue: tracks,
    });
    console.log("The queue is refreshed now. You are welcome.");
  });
  socket.on("pause", (id, callback) => {
    console.log("RECEIVED PAUSE COMMAND FROM SERVER: " + id);
    const guild = client.guilds.cache.get(id);
    const queue = client.player.nodes.get(guild);
    if (!queue) {
      console.log("There isn't even anything playing you scizophrenic mfer.");
      return;
    }
    queue.node.setPaused(true);
    callback({
      status: "ok",
    });
    console.log("The queue is paused now. You are welcome.");
  });
  socket.on("play", (id, callback) => {
    console.log("RECEIVED PLAY COMMAND FROM SERVER: " + id);
    const guild = client.guilds.cache.get(id);
    const queue = client.player.nodes.get(guild);
    if (!queue) {
      console.log("There isn't even anything playing you scizophrenic mfer.");
      return;
    }
    queue.node.setPaused(false);
    callback({
      status: "ok",
    });
    console.log("The queue is playing now. You are welcome.");
  });
  socket.on("next", (id, callback) => {
    console.log("RECEIVED SKIP COMMAND FROM SERVER: " + id);
    const guild = client.guilds.cache.get(id);
    const queue = client.player.nodes.get(guild);
    if (!queue) {
      console.log("There isn't even anything playing you scizophrenic mfer.");
      return;
    }
    queue.node.skip();
    const currentSong = queue.node.queue.currentTrack;
    callback({
      status: "ok",
      title: currentSong.title,
    });
    console.log("The song is skipped now. You are welcome.");
  });
  socket.on("getCurrent", (id, callback) => {
    console.log("RECEIVED REQUEST TO GET CURRENT SONG FROM SERVER: " + id);
    const guild = client.guilds.cache.get(id);
    const queue = client.player.nodes.get(guild);
    if (!queue) {
      console.log("There isn't even anything playing you scizophrenic mfer.");
      return;
    }
    const currentSong = queue.node.queue.currentTrack;
    if (!currentSong) {
      return;
    }
    callback({
      status: "ok",
      title: currentSong.title,
    });
    console.log("Sent currentSong data. " + currentSong);
  });
  socket.on("getMemb", (id, callback) => {
    members(id, callback);
  });
  async function members(id, callback) {
    console.log("RECEIVED REQUEST TO GET ALL MEMBERS FROM SERVER: " + id);
    const guild = await client.guilds.cache.get(id);
    const memberArray = [];
    await guild.members.fetch().then((fetchedMembers) => {
      fetchedMembers.forEach((member) => {
        memberArray.push({
          username: member.user.username,
          id: member.user.id,
        });
      });
      callback({
        status: "ok",
        members: memberArray,
      });
      console.log("Member Array:", memberArray);
    });
  }
  socket.on("saveRes", (countryName, username, id, callback) => {
    saveReservation(countryName, username, id, callback);
  });
  async function saveReservation(countryname, username, id, callback) {
    console.log("RECEIVED SAVERES DATABASE COMMAND FROM SERVER: " + id);
    const serverDB = dbClient.db("PanzerDB");
    const collection = `reservedCountries_${id}`;

    //get userid from username
    await collection.findOneAndUpdate(
      { countryName: countryname },
      {
        $set: {
          isReserved: true,
          userWhoReserved: userid,
        },
      }
    );
    callback({
      status: "ok",
    });
    console.log("The database has been updated. You are welcome.");
  }
  socket.on("addSong", (id, input, callback) =>
    addSongFun(id, input, callback)
  );

  async function addSongFun(id, input, callback) {
    console.log("RECEIVED ADDSONG COMMAND FROM SERVER: " + id);
    const player = useMainPlayer();
    player.extractors.register(YoutubeiExtractor, {});
    const guild = client.guilds.cache.get(id);
    const queue = await client.player.nodes.create(guild);
    if (!queue) {
      console.log("There isn't even anything playing you scizophrenic mfer.");
      return;
    } // Also socket send the logged in user id on the dashboard to let bot join their channel
    const result = await client.player.search(input, {
      requestedBy: "dashboardUser",
      searchEngine: QueryType.YOUTUBE_SEARCH,
    });

    if (result.tracks.length === 0) {
      console.log("no results found");
      return;
    }
    const song = result.tracks[0];
    queue.addTrack(song);
    callback({
      status: "ok",
    });
    console.log("The song has been added: " + song.title);
  }
});

client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
});
client.player.extractors.register(YoutubeiExtractor, {});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const player = useMainPlayer();
  player.extractors.register(YoutubeiExtractor, {});

  await initModels();

  // Retrieve all guilds the bot is in
  const guilds = client.guilds.cache;

  async function connect() {
    try {
      await dbClient.connect();

      await listDatabases(dbClient);
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }

  connect();
  async function listDatabases(dbClient) {
    databasesList = await dbClient.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
  }

  // Loop through each guild and create a collection if it doesn't exist
  for (const guild of guilds.values()) {
    console.log(guild.id);
    const serverDB = dbClient.db("PanzerDB");
    const collectionName = `reservedCountries_${guild.id}`;
    const hostInfoCollectionName = `hostInfo_${guild.id}`;
    const musicCollectionName = `music_${guild.id}`;
    const configCollection = serverDB.collection(`configInfo`);

    try {
      const collectionExists = await serverDB
        .listCollections({ name: collectionName })
        .hasNext();

      if (!collectionExists) {
        // If the collection doesn't exist, create it
        await serverDB.createCollection(collectionName);
        console.log(
          `Collection '${collectionName}' created for server ${guild.name}`
        );
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
        console.log(
          `Collection '${hostInfoCollectionName}' created for server ${guild.name}`
        );
      }

      // Check if the music collection exists
      const musicCollectionExists = await serverDB
        .listCollections({ name: musicCollectionName })
        .hasNext();

      // Create the music collection if it doesn't exist
      if (!musicCollectionExists) {
        await serverDB.createCollection(musicCollectionName);
        console.log(
          `Collection '${musicCollectionName}' created for server ${guild.name}`
        );
      }

      const configCollectionExists = await configCollection.findOne({
        serverID: guild.id,
      });

      if (!configCollectionExists) {
        await configCollection.insertOne({
          serverID: guild.id,
        });
        console.log("New config document added!");
      }
    } catch (err) {
      console.error(err);
    }
  }

  const rest = new REST({ version: "9" }).setToken(TOKEN);

  // Fetch all the guilds the bot is in
  console.log("guilds " + guilds);
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

      console.log(
        `Successfully deployed slash commands for server ${guild.name}`
      );
    } catch (err) {
      console.error(
        `Error deploying slash commands for server ${guild.name}:`,
        err
      );
    }
  }

  function generateRandomNumber(maxLimit) {
    let rand = Math.random() * maxLimit;
    rand = Math.floor(rand);
    return rand;
  }

  activityList = [
    "the Fall of the Western Roman Empire",
    "the Library of Alexandria Burn",
    "the Battle of Hastings",
    "Hamlet",
    "the Final Days of WWII",
    "the Russian Revolution",
    "the Louisiana Purchase",
    "the American Civil war",
    "the Battle of Cannae",
    "the Battle of Stalingrad",
  ];

  client.user.setPresence({
    activities: [
      {
        name: activityList[generateRandomNumber(activityList.length)],
        type: ActivityType.Watching,
      },
    ],
    status: "online",
  });

  console.log("Successfully loaded");
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isAutocomplete()) {
    try {
      if (interaction.commandName === "play") {
        const focusedValue = interaction.options.getFocused();
        const query = focusedValue;
        const suggestions = await getSongSuggestions(query);
        await interaction.respond(
          suggestions.slice(0, 25).map((track) => ({
            name: track.title,
            value: track.title,
          }))
        );
        console.log(suggestions);
      }
      if (interaction.commandName === "lyrics") {
        const focusedValue = interaction.options.getFocused();
        const query = focusedValue;
        const suggestions = await getSongSuggestions(query);
        await interaction.respond(
          suggestions.slice(0, 25).map((track) => ({
            name: track.title,
            value: track.title,
          }))
        );
        console.log(suggestions);
      }
    } catch (e) {
      console.error(e);
    }
  }
  async function getSongSuggestions(query) {
    try {
      const results = await client.player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_SEARCH,
      });

      if (results.tracks.length === 0) {
        console.log("no suggestions found");
        return [];
      }

      return results.tracks;
    } catch (error) {
      console.error("Error fetching song suggestions:", error);
      return []; // Return an empty array in case of errors
    }
  }

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
// require("./dashboard/server"); // UNCOMMENT THIS TO START THE DASHBOARD!
(module.exports = client), app;
console.log("LOGGED IN!");
