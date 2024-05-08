const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("today")
    .setDescription("Returns a random thing that happened today, another year."),
  run: async ({ client, interaction }) => {
    const url = 'https://en.wikipedia.org/wiki/Main_Page'
    const articles = []
    axios(url).then(response => {
      const html = response.data
      const $ = cheerio.load(html)
      
      let count = 0;
      $('#mp-otd', html).each( async function () {
        const things = $(this).find('p').text()
        const things_url = $(this).find('a').attr('href')
        $(this).find('li').each(function () {
          if (count < 5) {
            const occ = $(this).text()
            const url = $(this).find('a').attr('href')
            const year = $(this).find('a').attr('title')
            articles.push({
                year,
                occ,
                url
            })
            count++;
          }

        })
        articles.push({things, things_url})
        const date = new Date();
        const dateNameArray = [
          'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
        ]
        const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(`Historical Events that occurred on the ${date.getDate()}th of ${dateNameArray[date.getMonth()]}.`)
        .setDescription(`\u200b`)
        .addFields(
          {name: articles[0].year, value: `[${articles[0].occ}](https://en.wikipedia.org${articles[0].url})`, inline: true},
          {name: articles[1].year, value: `[${articles[1].occ}](https://en.wikipedia.org${articles[1].url})`, inline: true},
          {name: articles[2].year, value: `[${articles[2].occ}](https://en.wikipedia.org${articles[2].url})`, inline: true},
          {name: articles[3].year, value: `[${articles[3].occ}](https://en.wikipedia.org${articles[3].url})`, inline: true},
          {name: articles[4].year, value: `[${articles[4].occ}](https://en.wikipedia.org${articles[4].url})`, inline: true},
          {name: date.getFullYear().toString(), value: `[${articles[5].things}](https://en.wikipedia.org${articles[5].things_url})`},
        )
        .setTimestamp()
        await interaction.editReply({ embeds: [embed] });
      })
      console.log(articles)
    }).catch(error => console.log(error))
    
    
    
    
  },
}