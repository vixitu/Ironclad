const { dbClient } = require('../../../main.js');
const db = dbClient.db('PanzerDB')

const dotenv = require("dotenv");
const { Client, GatewayIntentBits} = require('discord.js')
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});
dotenv.config();
TOKEN = process.env.TOKEN;
client.login(TOKEN);


module.exports.songDatas = async(id) => {
    const collection = db.collection(`music_${id}`)
    const songs = await collection.find().toArray();
    const formattedSongs = await Promise.all(
        songs.map(async (song) => {
          return {
            songName: song.songName,
            songAuthor: song.songAuthor,
            songDuration: song.songDuration
          };
        })
      );
    console.log(formattedSongs)
    return formattedSongs;
};
