const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { QueryType, useMainPlayer } = require("discord-player");
const { YoutubeExtractor } = require("@discord-player/extractor");
const { dbClient } = require("../main.js");
const { YoutubeiExtractor } = require("discord-player-youtubei");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song.")
    .addStringOption((option) =>
      option
        .setName("searchterm")
        .setDescription("The input to search for!")
        .setAutocomplete(true)
        .setRequired(true)
    ),
  run: async ({ client, interaction }) => {
    const serverID = interaction.guildId;
    const db = dbClient.db("PanzerDB");
    const collection = db.collection(`music_${serverID}`);
    const player = useMainPlayer();
    player.extractors.register(YoutubeiExtractor, {});

    if (!interaction.member.voice.channel) {
      await interaction.reply(
        "You are not in a voice channel you dumb twat! :3"
      );
      return;
    }

    const queue = await client.player.nodes.create(interaction.guild);
    if (!queue.connection)
      await queue.connect(interaction.member.voice.channel);

    let searchTerm = interaction.options.getString("searchterm");
    var result;

    if (searchTerm.includes("open.spotify.com")) {
      // The user has sent a spotify URL
      if (searchTerm.includes("open.spotify.com/playlist")) {
        // Spotify playlist
        result = await player.search(searchTerm, {
          requestedBy: interaction.user,
          searchEngine: QueryType.SPOTIFY_PLAYLIST,
        });
        console.log(result.playlist.title + " - spotify playlist")
        if (result.tracks.length === 0) {
          await interaction.editReply("no results found for ", searchTerm);
          return;
        }
        const playlist = result.playlist;
        await queue.addTrack(result.tracks);
        if (!queue.node.isPlaying()) await queue.node.play();

        const embed = new EmbedBuilder()
          .setDescription(
            `**The songs songs from [${playlist.title}](${playlist.url})** have been added to the Queue`
          )
          .setThumbnail(playlist.thumbnail)
          .setColor("#FF0000")
          .setFooter({ text: `Length: ${playlist.length}` });

        await interaction.editReply({ embeds: [embed] });

        return;
      } else if (searchTerm.includes("open.spotify.com/track")) {
        // Spotify song
        result = await player.search(searchTerm, {
          requestedBy: interaction.user,
          searchEngine: QueryType.SPOTIFY_SONG,
        });
        console.log(result.tracks[0].title + " - spotify song")
      }
    } else {
      // Just a regular search term, or a youtube URL
      result = await player.search(searchTerm, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_SEARCH,
      });
      console.log(result.tracks[0].title + " - youtube song")
      if (result.tracks.length === 0) {
        await interaction.editReply("no results found for ", searchTerm);
        return;
      }
      const song = result.tracks[0];
      await queue.addTrack(song);
      if (!queue.node.isPlaying()) await queue.node.play();

      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`${song.title}`)
        .setDescription(`Added **[${song.title}](${song.url})**`)
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duration: ${song.duration}` });

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
