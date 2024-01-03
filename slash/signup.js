const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require('fs');
const path = require('path');
const { dbClient } = require('../main.js');

// Define a Map to keep track of reserved countries for each server
const serverReservedCountries = new Map();


module.exports = {
    serverReservedCountries,
  data: new SlashCommandBuilder()
    .setName("reserve")
    .setDescription("Only use this command to sign up for an ongoing game.")
        .addStringOption((option) =>
          option.setName("country").setDescription("Please choose one").setRequired(true).addChoices(
            { name: 'Germany', value: 'Germany :flag_de:' },
            { name: 'Soviet Union', value: 'Soviet Union <:sovietunion:1025151634071883786>' },
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
            { name: 'Greece', value: 'Greece <:flag_kgr:1148355753829216266>' },
            { name: 'Canada', value: 'Canada :flag_ca:' },
            { name: 'Australia', value: 'Australia :flag_au:' },
            { name: 'Netherlands', value: 'Netherlands :flag_nl:' },
            { name: 'Czechoslovakia', value: 'Czechoslovakia :flag_cz:' },
            { name: 'Yugoslavia', value: 'Yugoslavia <:flag_yu:1148355331676700753>' },
            { name: 'Norway', value: 'Norway :flag_no:' },
            { name: 'Finland', value: 'Finland :flag_fi:' }
          )
        ),
  run: async ({ client, interaction }) => {
    const db = dbClient.db('PanzerDB');
    const serverID = interaction.guildId; // Get the server ID
    const collection = db.collection(`reservedCountries_${serverID}`);
    const countryToSignUp = interaction.options.getString("country");
    const userID = interaction.user.id; // Get the user's ID
    const isHostingCol = db.collection(`hostInfo_${serverID}`)
    const isHostingValue = isHostingCol.findOne({isHosting: false})
    if(!isHostingValue){
        await interaction.editReply("There is no game being hosted right now!")
        return
    }
      // Check if the selected country is already reserved by any user in the database
      const existingReservation = await collection.findOne({ countryName: countryToSignUp });
      const userReservation = await collection.findOne({userWhoReserved : userID})

      if (existingReservation) {
          if (existingReservation.userWhoReserved === userID) {
              await interaction.editReply("You've already reserved this country. You cannot switch to another one.");
              console.log(`${userID} tried to take ${countryToSignUp} but he already took ${existingReservation.countryName}.`)
          } else {
              // Fetch the username from Discord based on the userWhoReserved ID
              const user = client.users.cache.get(existingReservation.userWhoReserved);
              const reservedByUserName = user ? user.toString() : "Unknown User";
              await interaction.editReply(`Sorry, ${countryToSignUp} is already taken by ${reservedByUserName}.`);
              console.log(`${userID} tried to pick ${countryToSignUp} but it was already taken by ${reservedByUserName}`);
          }
      } else {
        if(userReservation){
            await interaction.editReply(`You have already reserved ${userReservation.countryName}. You cannot pick multiple. Use Co-op command instead.`);
            console.log(`${userID} tried to take ${countryToSignUp} but he already took ${userReservation.countryName}.`)
        } else {
            // Reserve the country in the database
            await collection.insertOne({
                countryName: countryToSignUp,
                isReserved: true,
                userWhoReserved: userID
            });
            await interaction.editReply(`You've successfully reserved ${countryToSignUp}.`);
            console.log(`${userID} took ${countryToSignUp}`);
        }
          
      }
  },
  
};
