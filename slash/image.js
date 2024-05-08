const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("image")
    .setDescription("Returns an image from the search query."),
  run: async ({ client, interaction }) => {
    
    
    await interaction.editReply("This command is still a Work in Progress.");
    
  },
}
