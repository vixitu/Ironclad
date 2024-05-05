const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require('fs');
const path = require('path');
const { dbClient } = require('../main.js');

// Define a Map to keep track of reserved countries for each server
const serverReservedCountries = new Map();

module.exports = {
    serverReservedCountries,
  data: new SlashCommandBuilder()
    .setName("unreserve")
    .setDescription("Only use this command to remove your sign up for an ongoing game."),
  run: async ({ client, interaction }) => {
    const db = dbClient.db('PanzerDB');
    const serverID = interaction.guildId; // Get the server ID
    const collection = db.collection(`reservedCountries_${serverID}`);
    const userID = interaction.user.id; // Get the user's ID
    
      // Check if the selected country is already reserved by any user in the database
      const existingReservation = await collection.findOne({ userWhoReserved: userID });
      const existingCOOPReservation = await collection.findOne({userCOOP: userID})

      if (existingReservation) {
          if (existingReservation.userWhoReserved === userID) {
              await interaction.editReply(`Succesfully unreserved ${existingReservation.displayName}`);
              console.log(`${userID} unreserved${existingReservation.countryName}.`)
              await collection.updateOne(existingReservation, {
                $set: {
                  isReserved: false,
                  userWhoReserved: null
                  }
                })
          }
      } else {
          if (existingCOOPReservation) {
              await interaction.editReply(`Succesfully unreserved ${existingCOOPReservation.countryName} (coop)`);
              console.log(`${userID} unreserved ${existingCOOPReservation.countryName}.`)
              const update = {
                  $set: {
                      userCOOP: null
                  }
              }
              await collection.updateOne(existingCOOPReservation, update)
          } else{
          await interaction.editReply(`You have not reserved any country.`);
          console.log(`${userID} tried to unreserve a country, but they never reserved one.`);
      }
    }
  },
};
