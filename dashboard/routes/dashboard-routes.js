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

const express = require('express');
const { validateGuild } = require("../modules/middleware");
const router = express.Router()

router.get('/dashboard', (req, res) => res.render('dashboard/index', {subtitle: 'Dashboard'}))

router.get(`/servers/:id`, validateGuild, (req, res) => res.render('dashboard/show', {
    subtitle: 'Dashboard'
}));
module.exports = router