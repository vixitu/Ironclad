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
        .setDescription('This is my amazing multifunctional HOI4/Music/Trivia/Whatever bot, please enjoy and if you need help you can contact mr Vixitu. Also make sure to check out [the website.](http://ironclad.ddns.net:3000/)')
        .setThumbnail('https://i.imgur.com/NUbOdy1.jpg')
        .addFields(
            { name: '/bugreport', value: 'Report a bug to the developers.', inline: true },
            { name: '/config', value: 'Configure bot settings for the server.', inline: true },
            { name: '/coop', value: 'Allows you to cooperate on a country with another player.', inline: true },
            { name: '/clear', value: 'Clears the current music queue.', inline: true },
            { name: '/host', value: 'Hosts a new game session.', inline: true },
            { name: '/image', value: 'Fetches and displays an image.', inline: true },
            { name: '/info', value: 'Shows detailed information about all commands.', inline: true },
            { name: '/list', value: 'Returns a list of all reserved countries and their owners.', inline: true },
            { name: '/lyrics', value: 'Fetches song lyrics.', inline: true },
            { name: '/pause', value: 'Pauses the current song.', inline: true },
            { name: '/play', value: 'Starts playing a song.', inline: true },
            { name: '/queue', value: 'Shows the current song queue.', inline: true },
            { name: '/quote', value: 'Fetches a random quote.', inline: true },
            { name: '/resume', value: 'Resumes a paused song.', inline: true },
            { name: '/shuffle', value: 'Shuffles the current playlist.', inline: true },
            { name: '/signup', value: 'Signs up a player for a HOI4 game.', inline: true },
            { name: '/skip', value: 'Skips the current song.', inline: true },
            { name: '/skipto', value: 'Skips directly to a specified song in the queue.', inline: true },
            { name: '/stophost', value: 'Stops the current hosted session.', inline: true },
            { name: '/today', value: 'Displays information or events happening today.', inline: true },
            { name: '/trivia', value: 'Starts a trivia quiz.', inline: true },
            { name: '/unreserve', value: 'Unreserves a previously reserved country.', inline: true },
            { name: '/website', value: 'Shares the link to the bot’s official website.', inline: true }
        )
        .setImage('https://i.imgur.com/NUbOdy1.jpg')
        .setTimestamp()
        .setFooter({ text: 'Developed by vixitu', iconURL: 'https://cdn.discordapp.com/avatars/306361580533317632/cab119fc4431858ea095538128a44ad8.webp?size=32' });
    await interaction.editReply({ embeds: [listEmbed] });

  },
};
