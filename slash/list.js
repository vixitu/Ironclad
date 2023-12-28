const { SlashCommandBuilder } = require("@discordjs/builders");
const {EmbedBuilder } = require("discord.js");
const { dbClient } = require('../main.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("List all reserved countries and their owners"),
  run: async ({ client, interaction }) => {
    try {
      const serverID = interaction.guildId
      // Access the database and collection
      const db = dbClient.db("PanzerDB");
      const collection = db.collection(`reservedCountries_${serverID}`);
      const hostCollection = db.collection(`hostInfo_${serverID}`)

      // Query the database to retrieve the list of reserved countries
      const reservedCountries = await collection.find({ isReserved: true }).toArray();
      const hostGames = await hostCollection.findOne({isHosting: true})
      // Check if there are any reserved countries
      if (reservedCountries.length === 0) {
        const noReservedCountriesEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Reserved Countries")
          .setDescription("No countries have been reserved yet.");
        await interaction.editReply({ embeds: [noReservedCountriesEmbed] });
        return;
      }

      const listEmbed = new EmbedBuilder()
        .setTitle("Reserved Countries")
        .setColor("#FF0000")
        .setFooter({text: '*List of reserved countries and their owners'})
        .setDescription(`This is for the game being hosted by <@${hostGames.hostOwner}> at ` + (hostGames.hostingTime ? `<t:${hostGames.hostingTime}>` : ''));

      reservedCountries.forEach((country) => {
          const { countryName, userWhoReserved, userCOOP } = country;
          const value = `<@${userWhoReserved}>` + (userCOOP ? `\n<@${userCOOP}>` : '')
          listEmbed.addFields(
              { name: countryName, value, inline: true }
          );
        
        
      });

      await interaction.editReply({ embeds: [listEmbed] });
    } catch (error) {
      console.error("Error querying MongoDB:", error);
      await interaction.editReply("An error occurred while fetching the reserved countries.");
    }
  },
};
