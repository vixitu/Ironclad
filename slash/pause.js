const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { Player } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pauses the queue."),
  run: async ({ client, interaction }) => {

    const queue = await client.player.nodes.get(interaction.guild)
    console.log(queue)
    if(!queue){
        interaction.reply("There isn't even anything playing you scizophrenic mfer.")
        return
    }
    queue.node.setPaused(true);

    await interaction.editReply("The queue is paused now. You are welcome.");
    
  },
}
