const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { QueryType, useMainPlayer } = require('discord-player')
const { YoutubeExtractor } = require('@discord-player/extractor')
const { YoutubeiExtractor } = require("discord-player-youtubei");
const { dbClient } = require('../main.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Plays a playlist. (WIP)")
    .addStringOption(option =>
		option.setName('url')
			.setDescription('The playlist to search for!')
            .setAutocomplete(true)
            .setRequired(true)),
  run: async ({ client, interaction }) => {
    const serverID = interaction.guildId
    const db = dbClient.db('PanzerDB')
    const collection = db.collection(`music_${serverID}`)

    // client.player.extractors.register(YoutubeExtractor)
    const player = useMainPlayer();
    player.extractors.register(YoutubeiExtractor, {});
    if(!interaction.member.voice.channel){
        await interaction.reply("You are not in a voice channel you dumb twat! :3")
        return;
    }

    
    const queue = await client.player.nodes.create(interaction.guild)
    if(!queue.connection) await queue.connect(interaction.member.voice.channel)
    let embed = new EmbedBuilder()
    let url = interaction.options.getString("url")
            const result = await player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            if (result.tracks.size === 0)
                return interaction.editReply("No results")
            console.log(result.playlist)
            const playlist = result.playlist
            await queue.addTrack(result.tracks)
            embed
                .setDescription(`**The songs songs from [${playlist.title}](${playlist.url})** have been added to the Queue`)
                .setThumbnail(playlist.thumbnail)

    if (result.tracks.length === 0){
        await interaction.editReply('no results found')
        return
    }
    const song = result.tracks[0]
    await queue.addTrack(song)
    if (!queue.node.isPlaying()) await queue.node.play()

    await interaction.editReply({
        embeds: [embed]
    })
    
    
  },
}
