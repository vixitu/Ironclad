const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const puppeteer = require('puppeteer')
const axios = require('axios')
const cheerio = require('cheerio')
const { setTimeout } = require("timers/promises")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("quote")
        .setDescription("Returns a random quote.")
        .addStringOption((option) =>
            option.setName("category").setDescription("Pick a category of quotes.").setRequired(false).addChoices(
              { name: 'Anxiety', value: 'anxiety' },
              { name: 'Change', value: 'change' },
              { name: 'Choice', value: 'choice' }
            )
        )
        .addStringOption((option) =>
            option.setName("author").setDescription("Pick an author to get a random quote from.").setRequired(false)
        ),
    run: async ({ client, interaction }) => {
        const specificAuthor = interaction.options.getString("author")
        if (specificAuthor){
            const url = 'https://zenquotes.io/authors/'
            const searchTerm = specificAuthor.replace(/\s+/g, '+');
            const wikiQuery = specificAuthor.replace(/\s+/g, '_');
            const searchQuery = url + searchTerm;
            const quotes = []
            const length = 9;
            const number = Math.floor(Math.random() * length)
            console.log(`PARAMETERS: AUTHOR (specified): ${specificAuthor}, SEARCH QUERY: ${searchQuery}`)
            axios(searchQuery).then(response => {
              const html = response.data
              const $ = cheerio.load(html)
              $('.container', html).each(async function() {
                const quotelist = $(this).find('.row featurette').each(function(){
                  const quote = $(this).find('.card shadow-sm card-body text-center p-3 h-100 quote-block').attr('blockquote')
                  console.log(quote)
                  quotes.push(quote)
                })
                console.log(quotes)
                const embed = new EmbedBuilder()
                    .setColor("#355E3B")
                    .setTitle(`"${quotes[number]}"`)
                    .setAuthor({ name: specificAuthor,url: `https://en.wikipedia.org/wiki/${wikiQuery}`})
                    .setDescription('\u200b')
                    .setTimestamp()
                    await interaction.editReply({ embeds: [embed] });
                    return
                
              })
              
            })

        }
        if(!specificAuthor){
        const api_url ="https://zenquotes.io/api/quotes/";
        const response = await fetch(api_url);
        var data = await response.json();
        console.log(data)
        
        const length = data.length
        const number = Math.floor(Math.random() * length)
        const author = data[number].a
        const searchQuery = author.replace(/\s+/g, '+');
        const wikiQuery = author.replace(/\s+/g, '_');
        const wikimediaURL = `https://commons.wikimedia.org/w/index.php?search=${searchQuery}&title=Special:MediaSearch&go=Go&type=image`
        console.log(`PARAMETERS: LENGTH: ${length}, NUMBER: ${number}, AUTHOR: ${author}, SEARCH QUERY: ${searchQuery}`)
        if(author === 'zenquotes.io'){
            console.log('Rate Limit Reached')
            await interaction.editReply("Rate Limit Reached. Please try again in a few moments.");
            return
        }
        axios(wikimediaURL).then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            count = 0
            $('.sdms-search-results', html).each(async function () {
                if(count < 1){
                    const url = $(this).find('img').attr('src')
                    console.log('URL:' + url)
                    count++;
                    const embed = new EmbedBuilder()
                    .setColor("#355E3B")
                    .setTitle(`"${data[number].q}"`)
                    .setAuthor({ name: author, iconURL: url,url: `https://en.wikipedia.org/wiki/${wikiQuery}`})
                    .setThumbnail(url)
                    .setDescription('\u200b')
                    .setTimestamp()
                    await interaction.editReply({ embeds: [embed] });
                }
              })
              
        })
      }
        
          
        


    },
}