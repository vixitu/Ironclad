const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { lyricsExtractor } = require('@discord-player/extractor')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Gets the lyrics of the given song.") 
    .addStringOption(option =>
		option.setName('lyricsterm')
			.setDescription('The input to search for!')
            .setAutocomplete(true)
            .setRequired(true)),
  run: async ({ client, interaction }) => {
    
    const lyricsFinder = lyricsExtractor(/* 'optional genius API key' */);

    const lyrics = await lyricsFinder.search(interaction.options.getString('lyricsterm')).catch(() => null);
    if (!lyrics) return interaction.editReply({ content: 'No lyrics found', ephemeral: true });

    const trimmedLyrics = lyrics.lyrics.substring(0, 1997);

    const embed = new EmbedBuilder()
        .setTitle(lyrics.title)
        .setURL(lyrics.url)
        .setThumbnail(lyrics.thumbnail)
        .setAuthor({
            name: lyrics.artist.name,
            iconURL: lyrics.artist.image,
            url: lyrics.artist.url
        })
        .setDescription(trimmedLyrics.length === 1997 ? `${trimmedLyrics}...` : trimmedLyrics)
        .setColor('Yellow');

    return interaction.editReply({ embeds: [embed] });
    
  },
}
