const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("website")
    .setDescription("Gives the link to the website."),
  run: async ({ client, interaction }) => {

    const listEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle('Ironclad Website')
        .setURL('http://ironclad.ddns.net:3000/')
        .setDescription('Please login to the dashboard to have more control over the bot and unlock new functionalities.')

    await interaction.editReply({ embeds: [listEmbed] });
  },
};
