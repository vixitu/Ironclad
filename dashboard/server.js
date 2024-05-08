const bodyParser = require('body-parser')
const express = require('express')
const methodOverride = require('method-override')
const authRoutes = require('./routes/auth-routes')
const dashboardRoutes = require('./routes/dashboard-routes')
const rootRoutes = require('./routes/root-routes')
const cookies = require('cookies')
const app = express()
const middleware = require('./modules/middleware')

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
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`DASHBOARD: Server is live on port ${port}`))



