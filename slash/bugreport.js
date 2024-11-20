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
        // Send a direct message to vixitu, with the bug. OR even better: dm the user who ran the command so they can describe it and also add images/attachments
        const report = interaction.options.getString("bug");
        const vixituID = '306361580533317632';
        client.users.send(vixituID, report);
        console.log('bug reported!')
        await interaction.editReply("Thanks for submitting a bug/feature!");

    }
}
