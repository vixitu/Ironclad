const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require('fs');
const path = require('path');
const { dbClient } = require('../main.js');
const {EmbedBuilder} = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("bugreport")
        .setDescription("Only use this command to report a bug or something the bot could improve upon.")
        .addStringOption((option) =>
            option.setName("bug").setDescription("Please describe the bug").setRequired(true))
        .addStringOption((option) =>
            option.setName("category").setDescription("Choose the category").setRequired(true).addChoices(
                { name: "BUG - HOI4", value: "BUG - HOI4"},
                { name: "BUG - Music", value: "BUG - Music"},
                { name: "BUG - Trivia", value: "BUG - Trivia"},
                { name: "BUG - Others", value: "BUG - Others"},
                { name: "Feature Suggestion", value: "Feature Suggestion"},
            )),
    run: async ({ client, interaction }) => {
        // Send a direct message to vixitu, with the bug. OR even better: dm the user who ran the command so they can describe it and also add images/attachments
        const report = interaction.options.getString("bug");
        const category = interaction.options.getString("category");
        const vixituID = '306361580533317632';

        const embed = new EmbedBuilder()
            .setColor("#355E3B")
            .setTitle(category)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL()})
            .setDescription(report)
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTimestamp()

        const reply = await client.users.send(vixituID, { embeds: [embed] });
        console.log('bug reported!')
        await interaction.editReply("Thanks for submitting a bug/feature!");
        await reply.react('❌');
        await reply.react('✅');
        await reply.react('⭐');

    }
}
