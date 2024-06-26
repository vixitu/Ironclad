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
const { gameHostedTF, findHost, findTime, getReservations } = require("../assets/js/hostingJS");
const { getOwnerDisplay, getGuild } = require("../assets/js/overviewJS");
const router = express.Router()

router.get('/dashboard', (req, res) => res.render('dashboard/index', {subtitle: 'Dashboard'}))

router.get(`/servers/:id`, validateGuild, async (req, res) => res.render('dashboard/show', {
    isHosted: await gameHostedTF(req.params.id),
    host: await findHost(req.params.id),
    time: await findTime(req.params.id),
    reservations: await getReservations(req.params.id),
    ownerName: await getOwnerDisplay(req.params.id),
    guildID: await getGuild(req.params.id),
    subtitle: 'Dashboard'
}));

router.put('/servers/:id/:module', validateGuild, async (req, res) => {
    try{

    } catch {
        
    }
})
module.exports = router