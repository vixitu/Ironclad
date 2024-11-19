const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { Player } = require('discord-player')

module.exports = {
  data: new SlashCommandBuilder()
    .setName("exit")
    .setDescription("Exits the channel."),
  run: async ({ client, interaction }) => {
    
    const queue = await client.player.nodes.get(interaction.guild)
    try{
        await queue.destroy();
        await interaction.editReply('why :(');
    } catch (e){
      await interaction.editReply("Something went wrong, sorry, but here's why:", e)
      console.log(e);
    }

    
  },
}
