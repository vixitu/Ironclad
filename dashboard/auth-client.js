const dotenv = require("dotenv");
dotenv.config();
const CLIENTID = process.env.CLIENTID;
const SECRET = process.env.SECRET;
const DASHBOARD = process.env.DASHBOARD;
const OAuthClient = require('disco-oauth');
const authClient = new OAuthClient(CLIENTID, SECRET);
authClient.setRedirect(`${DASHBOARD}/auth`)
authClient.setScopes('identify', 'guilds')

module.exports = authClient;