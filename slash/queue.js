const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { Player } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Displays the queue."),
  run: async ({ client, interaction }) => {
    
    const queue = await client.player.nodes.get(interaction.guild)

    if(!queue){
        await interaction.editReply("There isn't even anything, you scizophrenic mfer.")
        return
    }
    if(queue.isPlaying() === false){ 
        await interaction.editReply("There isn't even anything playing you scizophrenic mfer.")
        return
    }
    const tracks = await queue.node.queue.tracks.store // tracks.slice is not a function ERR
    console.log(tracks) // this works
    
    const queueString = await tracks.slice(0, 10).map((song, i) => {
        return `${i + 1}) [${song.duration}]\ ${song.title} - <@${song.requestedBy.id}>`
    }).join("\n")
    

    const currentSong = await queue.node.queue.currentTrack
    console.log(currentSong)
    
    const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setDescription(`**Currently playing:**\n\ ${currentSong.title} - <@${currentSong.requestedBy.id}>\n\n**Queue:**\n${queueString}`)
        .setThumbnail(currentSong.thumbnail)

    await interaction.editReply({ embeds: [embed] });
    
  },
}
