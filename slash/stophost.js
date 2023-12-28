const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const fs = require('fs')
const path = require('path')
const { dbClient } = require('../main.js');

module.exports = {
	data: new SlashCommandBuilder().setName("stophost").setDescription("Only use this command to stop a current game."),
	run: async ({ client, interaction }) => {
        const serverID = interaction.guildId
        const db = dbClient.db('PanzerDB')
        const collection = db.collection(`hostInfo_${serverID}`);
        const reservationCollection = db.collection(`reservedCountries_${serverID}`)
        
        isHostingCol = await collection.findOne({isHosting: true})
        if(isHostingCol){
            await reservationCollection.deleteMany({isReserved: true})
            await collection.findOneAndDelete({isHosting: true})
            await interaction.channel.send({
                embeds: [new EmbedBuilder()
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription('Thanks for playing!')
                .setTitle(`Thanks for hosting ${interaction.user.username}`)
                ],
                
            })
        } else {
            await interaction.editReply("There is no game being hosted!")
        }
        
		
		
},

	}
