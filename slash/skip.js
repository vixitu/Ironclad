const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { Player } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song."),
  run: async ({ client, interaction }) => {
    
    const queue = await client.player.nodes.get(interaction.guild)

    if(!queue){
        interaction.reply("There isn't even anything playing you scizophrenic mfer.")
        return
    }
    const currentSong = queue.current
    queue.skip()

    const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setDescription(`Skipped **[${currentSong.title}](${currentSong.url})**`)
        .setThumbnail(currentSong.thumbnail)

    await interaction.editReply({ embeds: [embed] });
    
  },
}
