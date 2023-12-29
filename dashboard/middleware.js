const authClient = require('./auth-client')

module.exports.updateUser = async (req, res, next) => {
    try {
        const key = res.cookies.get('key')
        res.locals.user = await authClient.getUser(key)
    } finally {
        next()
    }
}