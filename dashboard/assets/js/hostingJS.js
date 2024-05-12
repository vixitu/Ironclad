const { dbClient } = require('../../../main.js');
const db = dbClient.db('PanzerDB')

const dotenv = require("dotenv");
const { Client, GatewayIntentBits} = require('discord.js')
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});
dotenv.config();
TOKEN = process.env.TOKEN;
client.login(TOKEN);


module.exports.gameHostedTF = async(id) => {
    yes = 'True'
    no = 'False'
    const collection = db.collection(`hostInfo_${id}`)
    isHostingCol = await collection.findOne({ isHosting: true })
    if (isHostingCol){
        return yes
    } else {
        return no
    }
};

module.exports.findHost = async(id) => {
    no = 'N/A'
    const collection = db.collection(`hostInfo_${id}`)
    isHostingCol = await collection.findOne({ isHosting: true })
    if (isHostingCol){
        const user = client.users.fetch(isHostingCol.hostOwner)
        const displayName = (await user).displayName
        return displayName;
    } else {
        return no
    }
};

module.exports.findTime = async(id) => {
    no = 'N/A'
    const collection = db.collection(`hostInfo_${id}`)
    isHostingCol = await collection.findOne({ isHosting: true })
    if (isHostingCol){
        if(isHostingCol.hostingTime != null){
            return isHostingCol.hostingTime
        } else {
            return no
        }
    } else {
        return no
    }
};

module.exports.getReservations = async(id) => {
    const collection = db.collection(`reservedCountries_${id}`)
    const reservations = await collection.find().toArray();
    const formattedReservations = await Promise.all(
        reservations.map(async (reservation) => {
          // Step 2a: Fetch Discord user
          if(reservation.userWhoReserved === null) {
            return {
                countryName: reservation.countryName,
                userName: 'N/A',
              };
          }
          const user = await client.users.fetch(reservation.userWhoReserved);
          
          // Step 2b: Return formatted reservation
          return {
            countryName: reservation.countryName,
            userName: user.username,
          };
        })
      );
    console.log(formattedReservations)
    return formattedReservations;
};