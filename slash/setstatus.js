const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActivityType } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("setstatus")
        .setDescription("Sets the status of the bot.")
        .addStringOption((option) =>
            option.setName("category").setDescription("Choose the category").setRequired(true).addChoices(
                { name: "Watching", value: "Watching"},
                { name: "Listening", value: "Listening"},
                { name: "Competing", value: "Competing"},
            ))
        .addStringOption((option) =>
            option.setName("text").setDescription("Please set the text").setRequired(true)),
    run: async ({ client, interaction }) => {
        const vixituID = '306361580533317632';

        if(interaction.user.id !== vixituID) {
            await interaction.editReply('You are not the developer of this bot!');
            return;
        }

        const category = interaction.options.getString("category");
        const text = interaction.options.getString("text");

        if (category === "Watching") client.user.setPresence({ activities: [{ name: text, type: ActivityType.Watching }], status: 'online' });
        if (category === "Listening") client.user.setPresence({ activities: [{ name: text, type: ActivityType.Listening }], status: 'online' });
        if (category === "Competing") client.user.setPresence({ activities: [{ name: text, type: ActivityType.Competing }], status: 'online' });

        await interaction.editReply(`My status has been set to ${category} **${text}**`);

}
}
