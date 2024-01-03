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

module.exports.getOwnerDisplay = async (id) => {
    const guild = client.guilds.cache.get(id);
    const owner = await client.users.fetch(guild.ownerId);
    return owner.displayName;
};