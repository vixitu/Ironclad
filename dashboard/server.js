const bodyParser = require('body-parser')
const express = require('express')
const methodOverride = require('method-override')
const authRoutes = require('./routes/auth-routes')
const dashboardRoutes = require('./routes/dashboard-routes')
const rootRoutes = require('./routes/root-routes')
const cookies = require('cookies')
const { Server } = require('socket.io');
const middleware = require('./modules/middleware')
const { createServer } = require('node:http')
const clientIO = require('socket.io-client')
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


const app = express()
const server = createServer(app)
const io = new Server(server);

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride('_method'))

app.use(cookies.express('a', 'b', 'c'))
app.use(express.static(`${__dirname}/assets`));
app.locals.basedir = `${__dirname}/assets`;

app.use('/',
    middleware.updateUser,
    rootRoutes,
    authRoutes, middleware.validateUser, middleware.updateGuilds, dashboardRoutes)

app.all('*', (req, res) => res.render('errors/404'))

const serverSocketUrl = 'ws://localhost:8000';
const serverSocket = clientIO(serverSocketUrl);
serverSocket.on('connect', () => {
    console.log('Connected to server websocket')
})

io.on('connection', (socket) => {
    console.log('SERVER: a user connnected');
    socket.on('refreshQueue', (id, callback) => {
        console.log('RECEIVED REQUEST TO GET QUEUE FROM CLIENT: ' + id)
        serverSocket.emit('getQueue', id, (response) =>{
            console.log(response)
            callback({
                status: response.status,
                queue: response.queue
            })
        })
    })
    socket.on('pause cmd', (id, callback) => {
        console.log('RECEIVED PAUSE COMMAND FROM CLIENT: ' + id)
        serverSocket.emit('pause', id, (response) =>{
            console.log(response.status)
            callback({
                status: response.status
            })
        })
    })
    socket.on('play cmd', (id, callback) => {
        console.log('RECEIVED PLAY COMMAND FROM CLIENT: ' + id)
        serverSocket.emit('play', id, (response) =>{
            console.log(response.status)
            callback({
                status: response.status
            })
        })
    })
    socket.on('next cmd', (id, callback) => {
        console.log('RECEIVED SKIP COMMAND FROM CLIENT: ' + id)
        serverSocket.emit('next', id, (response) =>{
            console.log(response)
            callback({
                status: response.status,
                title: response.title
            })
        })
    })
    socket.on('getCurrent', (id, callback) => {
        console.log('RECEIVED REQUEST FROM CLIENT TO GET CURRENT SONG: ' + id)
        serverSocket.emit('getCurrent', id, (response) =>{
            console.log(response.status)
            callback({
                status: response.status,
                currentTitle: response.title
            })
        })
    })
    socket.on('addSong cmd', (id, input, callback) => {
        console.log('RECEIVED ADDSONG COMMAND FROM CLIENT: ' + id + ' ' + input)
        serverSocket.emit('addSong', id, input, (response) =>{
            console.log(response.status)
            callback({
                status: response.status
            })
        })
    })
})

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`DASHBOARD: Server is live on port ${port}`))



