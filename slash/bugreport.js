const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require('fs');
const path = require('path');
const { dbClient } = require('../main.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("bugreport")
        .setDescription("Only use this command to report a bug or something the bot could improve upon.")
        .addStringOption((option) =>
            option.setName("bug").setDescription("Please describe the bug").setRequired(true)),
    run: async ({ client, interaction }) => {
        const db = dbClient.db('PanzerDB');
        const serverID = interaction.guildId; // Get the server ID
        const collection = db.collection(`bugCollection`);
        const userID = interaction.user.id; // Get the user's ID
        collection.insertOne({
            userID: userID,
            serverID: serverID,
            bugReport: interaction.options.getString('bug')
        })
        console.log('bug reported!')

    }
}
