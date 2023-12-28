const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { dbClient } = require('../main.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure bot settings")
    .addRoleOption((option) => option.setName("role").setDescription("the role").setRequired(false)),
  run: async ({ client, interaction }) => {
    try {
      console.log('config command ran')
      const serverID = interaction.guildId;
      // Access the database and collection
      const db = dbClient.db("PanzerDB");
      const configCollection = db.collection(`configInfo`);
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        console.log("user does not have administrator!");
        await interaction.editReply("Sorry, you do not have the right permissions to do this!");
        return;
      }

      // Retrieve the serverDocumentHost and await it
      const serverDocumentHost = await configCollection.findOne({ serverID: serverID });
      if (interaction.options.getRole('role')) {
        let hostRoleArg = interaction.options.getRole('role').id;
        const updatehostRole = {
          $set: {
            hostRole: hostRoleArg,
          },
        };
        console.log(serverDocumentHost)
        await configCollection.findOneAndUpdate({ serverID: serverID }, updatehostRole); // Use serverID to identify the document
        await interaction.editReply(`Host Role value set to: <@&${hostRoleArg}>`);
        console.log('host role value set ' + hostRoleArg);
      }

      const hostRole = serverDocumentHost?.hostRole || "Not Set";
      const hostRoleMention = hostRole === "Not Set" ? "Not Set" : `<@&${hostRole}>`; // Mention the role if it's set
      const configEmbed = new EmbedBuilder()
        .setTitle('Config')
        .setDescription(`Hosting role: ${hostRoleMention}\n`);
      await interaction.editReply({ embeds: [configEmbed] });
    } catch (error) {
      console.error("Error querying MongoDB:", error);
      await interaction.editReply("An error occurred while fetching the config.");
    }
  },
};
