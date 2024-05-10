const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Gives info of all the commands."),
  run: async ({ client, interaction }) => {

    const listEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle('Ironclad Information')
        .setURL('http://ironclad.ddns.net:3000/')
        .setAuthor({ name: 'vixitu', iconURL: 'https://cdn.discordapp.com/avatars/306361580533317632/cab119fc4431858ea095538128a44ad8.webp?size=32', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
        .setDescription('This is my amazing HOI4 bot, please enjoy and if you need help you can contact mr Vixitu. Also make sure to check out [the website.](http://ironclad.ddns.net:3000/)')
        .setThumbnail('https://i.imgur.com/NUbOdy1.jpg')
        .addFields(
            { name: '/Host', value: 'This command is used for hosting.', inline: true },
            { name: '/Stophost', value: 'Well, the very opposite of /host.', inline: true },
            { name: '/Reserve', value: 'This is how you can reserve a country.', inline: true },
            { name: '/Info', value: 'This command.', inline: true },
            { name: 'TO DO', value: 'All commands from this point onwards do not exist yet but are in active developement.'},
            { name: 'Config!', value: 'The server owner will be able to configure the bot to their liking, think of things like: making the bot use the server emojis instead of the default discord emojis or changing the role to ping when a hoi4 game gets hosted.', inline: true},
            { name: 'Recently added', value: 'Newest features.'},
            { name: 'Server Emojis!', value: 'The bot now uses server emojis to represent more historical flags!', inline: true},
            { name: 'Unreserving', value: 'You can now unreserve countries!', inline: true},
            { name: '/Coop', value: 'This is how you can coop a country.', inline: true },
        )
        .setImage('https://i.imgur.com/NUbOdy1.jpg')
        .setTimestamp()
        .setFooter({ text: 'Developed by vixitu', iconURL: 'https://cdn.discordapp.com/avatars/306361580533317632/cab119fc4431858ea095538128a44ad8.webp?size=32' });

    await interaction.editReply({ embeds: [listEmbed] });
  },
};
