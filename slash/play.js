const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { QueryType, useMainPlayer } = require('discord-player')
const { YoutubeExtractor } = require('@discord-player/extractor')
const { dbClient } = require('../main.js');
const { YoutubeiExtractor } = require("discord-player-youtubei");

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
    const player = useMainPlayer();
    player.extractors.register(YoutubeiExtractor, {});

    if(!interaction.member.voice.channel){
        await interaction.reply("You are not in a voice channel you dumb twat! :3")
        return;
    }

    
    const queue = await client.player.nodes.create(interaction.guild)
    if(!queue.connection) await queue.connect(interaction.member.voice.channel)

    let searchTerm = interaction.options.getString('searchterm');
    var result;
    // Spotify support!
    if(searchTerm.substring(0,31).startsWith("https://open.spotify.com/track/")){
      result = await player.search(searchTerm, {
        requestedBy: interaction.user,
        searchEngine: QueryType.SPOTIFY_SONG
      })
    } else {
      result = await player.search(searchTerm, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_SEARCH
      })
    }
    
    if (result.tracks.length === 0){
        await interaction.editReply('no results found for ', searchTerm)
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
