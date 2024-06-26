const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { QueryType } = require('discord-player')
const { YoutubeExtractor } = require('@discord-player/extractor')
const { dbClient } = require('../main.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song.")
    .addStringOption(option =>
		option.setName('searchterm')
			.setDescription('The input to search for!')
            .setAutocomplete(true)
            .setRequired(true)),
  run: async ({ client, interaction }) => {
    const serverID = interaction.guildId
    const db = dbClient.db('PanzerDB')
    const collection = db.collection(`music_${serverID}`)

    client.player.extractors.register(YoutubeExtractor)

    if(!interaction.member.voice.channel){
        await interaction.reply("You are not in a voice channel you dumb twat! :3")
        return;
    }

    
    const queue = await client.player.nodes.create(interaction.guild)
    if(!queue.connection) await queue.connect(interaction.member.voice.channel)

    let searchTerm = interaction.options.getString('searchterm');
    const result = await client.player.search(searchTerm, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_SEARCH
    })

    if (result.tracks.length === 0){
        await interaction.editReply('no results found')
        return
    }
    const song = result.tracks[0]
    await queue.addTrack(song)
    if (!queue.node.isPlaying()) await queue.node.play()
    

    const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`${song.title}`)
        .setDescription(`Added **[${song.title}](${song.url})**`)
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duration: ${song.duration}`});

    await interaction.editReply({ embeds: [embed] });
    
  },
}
