const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require('fs');
const path = require('path');
const { dbClient } = require('../main.js');

// Define a Map to keep track of reserved countries for each server
const serverReservedCountries = new Map();

module.exports = {
    serverReservedCountries,
  data: new SlashCommandBuilder()
    .setName("coop")
    .setDescription("Only use this command to coop a player.")
        .addStringOption((option) =>
          option.setName("country").setDescription("Please choose one").setRequired(true).addChoices(
            { name: 'Germany', value: 'Germany :flag_de:' },
            { name: 'Soviet Union', value: 'Soviet Union :flag_ru:' },
            { name: 'United States', value: 'United States :flag_us:' },
            { name: 'United Kingdom', value: 'United Kingdom :flag_gb:' },
            { name: 'British Raj', value: 'British Raj :flag_in:' },
            { name: 'Japan', value: 'Japan :flag_jp:' },
            { name: 'France', value: 'France :flag_fr:' },
            { name: 'Italy', value: 'Italy :flag_it:' },
            { name: 'Mexico', value: 'Mexico :flag_mx:' },
            { name: 'China', value: 'China :flag_cn:' },
            { name: 'Poland', value: 'Poland :flag_pl:' },
            { name: 'Spain', value: 'Spain :flag_es:' },
            { name: 'South Africa', value: 'South Africa :flag_sa:' },
            { name: 'Hungary', value: 'Hungary :flag_hu:' },
            { name: 'Romania', value: 'Romania :flag_ro:' },
            { name: 'Brazil', value: 'Brazil :flag_br:' },
            { name: 'Sweden', value: 'Sweden :flag_se:' },
            { name: 'Greece', value: 'Greece :flag_gr:' },
            { name: 'Canada', value: 'Canada :flag_ca:' },
            { name: 'Australia', value: 'Australia :flag_au:' },
            { name: 'Netherlands', value: 'Netherlands :flag_nl:' },
            { name: 'Czechoslovakia', value: 'Czechoslovakia :flag_cz:' },
            { name: 'Yugoslavia', value: 'Yugoslavia :flag_rs' },
            { name: 'Norway', value: 'Norway :flag_no:' },
            { name: 'Finland', value: 'Finland :flag_fi:' }
          )
        ),
  run: async ({ client, interaction }) => {
    const serverID = interaction.guildId; // Get the server ID
    const db = dbClient.db('PanzerDB');
    const collection = db.collection(`reservedCountries_${serverID}`);
    const countryToSignUp = interaction.options.getString("country");
    const userID = interaction.user.id; // Get the user's ID
    const isHostingCol = db.collection(`hostInfo_${serverID}`)
    const isHostingValue = isHostingCol.findOne({isHosting: true})
    if(!isHostingValue){
        await interaction.editReply("There is no game being hosted right now!")
        return
    }
      // Check if the selected country is already reserved by any user in the database
      const existingReservation = await collection.findOne({ displayName: countryToSignUp });
      const userReservation = await collection.findOne({userWhoReserved : userID})

      if (existingReservation) {
          if (existingReservation.userWhoReserved === userID) {
              await interaction.editReply("You've already reserved this country. You cannot coop yourself.");
              console.log(`${userID} tried to coop ${countryToSignUp} but he already took ${existingReservation.countryName}.`)
          } else {
              if (userReservation) {
                  await interaction.editReply(`You have already reserved ${userReservation.displayName}. You cannot pick multiple.`);
                  console.log(`${userID} tried to take ${countryToSignUp} but he already took ${userReservation.countryName}.`)
              } else {
                  // Fetch the username from Discord based on the userWhoReserved ID
                  const user = client.users.cache.get(existingReservation.userWhoReserved);
                  const reservedByUserName = user ? user.toString() : "Unknown User";
                  await interaction.editReply(`You are now co-oping ${existingReservation.displayName} together with ${reservedByUserName}.`);
                  const update = {
                      $set: {
                          userCOOP: userID, // Replace with the user ID you want to set
                          hasCOOP: true
                      }
                  }
                  await collection.updateOne(existingReservation, update)
                  console.log(`${existingReservation.countryName} is now being co-oped by ${userID} and the main player is ${existingReservation.userWhoReserved}`)
              }
              
          }
      } else {
        
          await interaction.editReply(`No one has reserved ${countryToSignUp} yet. Use the reserve command instead.`);
          console.log(`${userID} tried to take ${countryToSignUp} but no one took it.`)
        
          
      }
  },
  
};
