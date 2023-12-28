const express = require('express')

const app = express()

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')



app.use(express.static(`${__dirname}/assets`));
app.locals.basedir = `${__dirname}/assets`;

app.get('/', (req, res) => res.render('index', {subtitle: 'Home'}))
app.get('/commands', (req, res) => res.render('commands', {
    subtitle: 'Commands',
    categories: [{ name: 'Hosting Tools', icon: 'fas fa-gavel' },
    { name: 'Music', icon: 'fa-solid fa-music' },
    { name: 'Other', icon: 'fa-solid fa-question' }],
    commands: [{ name: 'Host', icon: 'fa-solid fa-slash fa-rotate-90'},
    { name: 'Stophost', icon: 'fa-solid fa-slash fa-rotate-90'},
    { name: 'Coop', icon: 'fa-solid fa-slash fa-rotate-90'}]
}))
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is live on port ${port}`))



