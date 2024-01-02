const authClient = require('./auth-client')
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

module.exports.updateGuilds = async (req, res, next) => {
    try {
        const key = res.cookies.get('key')
        if(key) {
            const authGuilds = await authClient.getGuilds(key)
            res.locals.guilds = getManageableGuilds(authGuilds)
        } 
    } finally {
        next()
    }
}


module.exports.updateUser = async (req, res, next) => {
    try {
        const key = res.cookies.get('key')
        if(key) res.locals.user = await authClient.getUser(key)
    } finally {
        next()
    }
}

module.exports.validateUser = async (req, res, next) => {
    res.locals.user ? next() : res.render('errors/401')
}

function getManageableGuilds(authGuilds) {
    const guilds = []
    for (const id of authGuilds.keys()) {
        const isManager = authGuilds
        .get(id).permissions
        .includes('MANAGE_GUILD');
        const guild = client.guilds.cache.get(id);
        if(!guild || !isManager) continue;
        guilds.push(guild);
    }
    return guilds
}
/* without using discord.js
function getManageableGuilds(authGuilds) {
    const guilds = []
    for(const guild of authGuilds.values()){
        if(guild && guild.permissions && guild.permissions.includes('MANAGE_GUILD')){
            guilds.push(guild)
        }
        else {
            continue;
        }
    }
    return guilds;
}
*/