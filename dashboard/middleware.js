const authClient = require('./auth-client')
const client = require('./server')

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

function getManageableGuilds(authGuilds) { // need to implement the client object into this, so i can use discord.js for the guilds, it contains way more information!
    const guilds = []
    for(const guild of authGuilds.values()){
        if(guild && guild.permissions && guild.permissions.includes('MANAGE_GUILD')){
            const guildJS = client.guilds.cache.get(guild._id)
            guilds.push(guild)
        }
        else {
            continue;
        }
    }
    return guilds;
}