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
        const reservedCollection = db.collection(`reservedCountries_${serverID}`)
        const countriesMap = new Map([
            ['Germany', 'Germany :flag_de:' ],
            ['Soviet Union', 'Soviet Union :flag_ru:' ],
            ['United States', 'United States :flag_us:' ],
            ['United Kingdom', 'United Kingdom :flag_gb:' ],
            ['British Raj', 'British Raj :flag_in:' ],
            ['Japan', 'Japan :flag_jp:' ],
            ['France', 'France :flag_fr:' ],
            ['Italy', 'Italy :flag_it:' ],
            ['Mexico', 'Mexico :flag_mx:' ],
            ['China', 'China :flag_cn:' ],
            ['Poland', 'Poland :flag_pl:' ],
            ['Spain', 'Spain :flag_es:' ],
            ['South Africa', 'South Africa :flag_sa:' ],
            ['Hungary', 'Hungary :flag_hu:' ],
            ['Romania', 'Romania :flag_ro:' ],
            ['Brazil', 'Brazil :flag_br:' ],
            ['Sweden', 'Sweden :flag_se:' ],
            ['Greece', 'Greece :flag_gr:' ],
            ['Canada', 'Canada :flag_ca:' ],
            ['Australia', 'Australia :flag_au:' ],
            ['Netherlands', 'Netherlands :flag_nl:' ],
            ['Czechoslovakia', 'Czechoslovakia :flag_cz:' ],
            ['Yugoslavia', 'Yugoslavia :flag_rs:' ],
            ['Norway', 'Norway :flag_no:' ],
            ['Finland', 'Finland :flag_fi:' ]
        ])

        const hostTime = interaction.options.getString("time");
        isHostingCol = await collection.findOne({ isHosting: true })
        const configCollection = db.collection(`configInfo`)
        const configDocServer = await configCollection.findOne({ serverID: serverID })
        const roleToPing = await configDocServer.hostRole
        console.log(`role to ping is ${roleToPing}`)

        if (isHostingCol) {
            await interaction.editReply("There is already a game being hosted, please end that one first!")
            console.log(`${userID} tried to host a game, but there is already one going on!`)
        } else {
            function insertCollectionReservations(value, key, map) {
                try {
                    reservedCollection.insertOne({
                        countryName: key,
                        displayName: value,
                        isReserved: false,
                        userWhoReserved: null,
                        userCOOP: null,
                        hasCOOP: null
                    });
                    console.log("Created reeservedCollection for " + key)
                } catch (error) {
                    console.error(`Error trying to add ${key}`)
                }
            }
            countriesMap.forEach(insertCollectionReservations)
                
            if (hostTime != null) {
                await collection.findOneAndReplace({isHosting: false}, {isHosting: true, hostingTime: hostTime, hostOwner: userID})
                await interaction.editReply("You are now hosting a game!")
                await interaction.channel.send({
                    embeds: await [new EmbedBuilder()
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setDescription(`<@&${roleToPing}>\nUse reserve to reserve a country!`)
                        .setTitle(`A game is being hosted at <t:${hostTime}> by ${interaction.user.username}! That's in <t:${hostTime}:R>!`)
                    ],
                })
            } else {
                await collection.findOneAndReplace({isHosting: false}, {isHosting: true, hostingTime: null, hostOwner: userID})
                await interaction.channel.send({
                    embeds: await [new EmbedBuilder()
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setDescription(`<@&${roleToPing}>\nUse reserve to reserve a country!`)
                        .setTitle(`A game is being hosted right now by ${interaction.user.username}.`)
                    ],
                })
            }
            await interaction.editReply("You are now hosting a game!")
            console.log('game being hosted!')

        }

    }
}
