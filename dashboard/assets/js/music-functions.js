const { dbClient } = require('../../../main');
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

// Assuming you have a way to communicate with your Discord bot (e.g., websockets)
const pauseSong = async function pauseSong() {
    console.log('paused')
    const queue = await client.player.nodes.get(interaction.guild)

    if(!queue){
        interaction.reply("There isn't even anything playing you scizophrenic mfer.")
        return
    }
    queue.isPaused(true)
    
  }
  
  async function playSong() {
    const queue = await client.player.nodes.get(interaction.guild)

    if(!queue){
        interaction.reply("There isn't even anything playing you scizophrenic mfer.")
        return
    }
    queue.setPaused(false)
    console.log('resumed')
  }
  
  async function nextSong() {
    const queue = await client.player.nodes.get(interaction.guild)

    if(!queue){
        interaction.reply("There isn't even anything playing you scizophrenic mfer.")
        return
    }
    const currentSong = queue.current
    queue.skip()
    console.log('skipped')
  }
module.exports = { pauseSong }