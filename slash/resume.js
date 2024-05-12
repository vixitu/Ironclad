const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { Player } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resumes the queue."),
  run: async ({ client, interaction }) => {
    
    const queue = await client.player.nodes.get(interaction.guild)

    if(!queue){
        interaction.reply("There isn't even anything playing you scizophrenic mfer.")
        return
    }
    queue.node.setPaused(false)

    await interaction.editReply("The queue is playing again now. You are welcome.");
    
  },
}
