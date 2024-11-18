const express = require('express')
const router = express.Router()
const dotenv = require("dotenv");
const authClient = require ('../modules/auth-client')
const sessions = require ('../modules/sessions')
dotenv.config();
const CLIENTID = process.env.CLIENTID;

router.get('/invite', (req, res) => 
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENTID}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth-guild&scope=bot`))

router.get('/login', (req, res) =>
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENTID}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth&scope=identify+guilds`))

router.get('/auth-guild', async (req, res) => {
    try {
        const key = res.cookies.get('key')
        await sessions.update(key)
    } finally {
        res.redirect('/dashboard')
    }
})

router.get('/auth', async (req, res) => {
    try {
        const code = req.query.code
        const key = await authClient.getAccess(code)

        res.cookies.set('key', key)

        res.redirect('/dashboard')
    } catch {
        res.redirect('/')
    }
})

router.get('/logout', (req, res) => {
    res.cookies.set('key', '')

    res.redirect('/')
})

module.exports = router