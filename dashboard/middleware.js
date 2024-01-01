const authClient = require('./auth-client')
const client = require('../main')
const { GatewayIntentBits } = require("discord.js");

module.exports.updateGuilds = async (req, res, next) => {
    try {
        const key = res.cookies.get('key')
        if(key) {
            const authGuilds = await authClient.getGuilds(key)
            console.log(authGuilds)
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
    for(const guild of authGuilds.values()){
        if(guild && guild.permissions && guild.permissions.includes('MANAGE_GUILD')){
            console.log(`Guild with key ${guild._name} has MANAGE_GUILD permission.`)
            guilds.push(guild)
        }
        else {
            console.log(`Guild with key ${guild._name} has insufficient permissions.`)
        }
    }
    return guilds;
}