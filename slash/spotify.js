const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType, useMainPlayer } = require("discord-player")
const { YoutubeExtractor } = require('@discord-player/extractor');
const { YoutubeiExtractor } = require("discord-player-youtubei");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("spotify")
		.setDescription("loads songs from spotify [DEPRECATED, use /play]")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("song")
				.setDescription("Loads a single song from a url")
				.addStringOption((option) => option.setName("url").setDescription("the song's url").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("playlist")
				.setDescription("Loads a playlist of songs from a url")
				.addStringOption((option) => option.setName("url").setDescription("the playlist's url").setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("search")
				.setDescription("Searches for song based on provided keywords")
				.addStringOption((option) =>
					option.setName("searchterms").setDescription("the search keywords").setRequired(true)
				)
		),
	run: async ({ client, interaction }) => {
		if (!interaction.member.voice.channel) return interaction.editReply("You need to be in a VC to use this command")
        

		const queue = await client.player.nodes.create(interaction.guild)
		if (!queue.connection) await queue.connect(interaction.member.voice.channel)
            
		let embed = new EmbedBuilder()

        //client.player.extractors.register(YoutubeExtractor, {});
        const player = useMainPlayer();
        player.extractors.register(YoutubeiExtractor, {});

		if (interaction.options.getSubcommand() === "song") {
            let url = interaction.options.getString("url")
            const result = await player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.SPOTIFY_SONG
            })
            
            if (result.tracks.size === 0)
                return interaction.editReply("No results")
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            if (!queue.node.isPlaying()) await queue.node.play()
            try {
                embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}`})
            } catch (error) {
                embed
                .setDescription(`Error`)
            }
            

		} else if (interaction.options.getSubcommand() === "playlist") {
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.SPOTIFY_PLAYLIST
            })

            if (result.tracks.size === 0)
                return interaction.editReply("No results")
            console.log(result.playlist)
            const playlist = result.playlist
            await queue.addTrack(result.tracks)
            embed
                .setDescription(`**The songs songs from [${playlist.title}](${playlist.url})** have been added to the Queue`)
                .setThumbnail(playlist.thumbnail)
		} else if (interaction.options.getSubcommand() === "search") {
            let url = interaction.options.getString("searchterms")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.SPOTIFY_SEARCH
            })
            

            if (result.tracks.size === 0)
                return interaction.editReply("No results")
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}`})
		}
        // if (!queue.node.isPlaying()) await queue.node.play()
        await interaction.editReply({
            embeds: [embed]
        })
	},
}