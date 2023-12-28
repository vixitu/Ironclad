const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const fs = require('fs')
const path = require('path')
const { dbClient } = require('../main.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("host")
        .setDescription("Only use this command to host.")
        .addStringOption((option) =>
            option.setName("time").setDescription("Please set the time (in UNIX format)").setRequired(false)),
    run: async ({ client, interaction }) => {

        const userID = interaction.user.id
        const serverID = interaction.guildId
        const db = dbClient.db('PanzerDB')
        const collection = db.collection(`hostInfo_${serverID}`)
        const hostTime = interaction.options.getString("time");
        isHostingCol = await collection.findOne({ isHosting: true })
        const configCollection = db.collection(`configInfo`)
        const configDocServer = await configCollection.findOne({serverID: serverID})
        const roleToPing = await configDocServer.hostRole
        console.log(`role to ping is ${roleToPing}`)
        if (isHostingCol) {
            await interaction.editReply("There is already a game being hosted, please end that one first!")
            console.log(`${userID} tried to host a game, but there is already one going on!`)
        } else {
            if (hostTime != null) {
                collection.insertOne({
                    isHosting: true,
                    hostingTime: hostTime,
                    hostOwner: userID
                })
                await interaction.channel.send({
                    embeds: await [new EmbedBuilder()
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setDescription(`<@&${roleToPing}>`)
                        .setTitle(`A game is being hosted by ${interaction.user.username} at <t:${hostTime}> or <t:${hostTime}:R>.`)
                    ],

                })
                await interaction.editReply("You are now hosting a game!")
            } else {
                collection.insertOne({
                    isHosting: true,
                    hostingTime: null,
                    hostOwner: userID
                })
                console.log("hosting game")
                await interaction.editReply('You are now hosting a game!')
                await interaction.channel.send({
                    embeds: await [new EmbedBuilder()
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setDescription(`<@&${roleToPing}>\nUse reserve to reserve a country!`)
                        .setTitle(`A game is being hosted right now by ${interaction.user.username}.`)
                    ],
                })
            }
        }
    },

}
