const express = require('express')
const router = express.Router()

router.get('/', (req, res) => res.render('index', {subtitle: 'Home'}))
router.get('/commands', (req, res) => res.render('commands', {
    subtitle: 'Commands',
    categories: [{ name: 'Hosting', icon: 'fas fa-gavel' },
    { name: 'Music', icon: 'fa-solid fa-music' },
    { name: 'Other', icon: 'fa-solid fa-question' }],
    commands: [
    { name: 'Host', icon: 'fa-solid fa-slash fa-rotate-90', category: 'Hosting'},
    { name: 'Stophost', icon: 'fa-solid fa-slash fa-rotate-90', category: 'Hosting'},
    { name: 'Coop', icon: 'fa-solid fa-slash fa-rotate-90', category: 'Hosting'}],
    commandsString: JSON.stringify([
    { name: 'Host', icon: 'fa-solid fa-slash fa-rotate-90', category: 'Hosting'},
    { name: 'Stophost', icon: 'fa-solid fa-slash fa-rotate-90', category: 'Hosting'},
    { name: 'Coop', icon: 'fa-solid fa-slash fa-rotate-90', category: 'Hosting'}])
}))

module.exports = router