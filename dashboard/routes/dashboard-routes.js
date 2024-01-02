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

const express = require('express')
const router = express.Router()

router.get('/dashboard', (req, res) => res.render('dashboard/index', {subtitle: 'Dashboard'}))

router.get(`/servers/:id`, (req, res) => res.render('dashboard/show', {
    guild: client.guilds.cache.get(req.params.id),
    subtitle: 'Dashboard'
}));
module.exports = router