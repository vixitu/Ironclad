const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const puppeteer = require('puppeteer')
const axios = require('axios')
const cheerio = require('cheerio')


module.exports = {
    data: new SlashCommandBuilder()
        .setName("trivia")
        .setDescription("Starts a trivia.")
        .addStringOption((option) =>
            option.setName("questions").setDescription("Choose an amount of questions.").setRequired(true)
        )
        .addStringOption((option) =>
            option.setName("difficulty").setDescription("Choose a difficulty.").setRequired(true).addChoices(
                { name: 'Easy', value: 'easy'},
                { name: 'Medium', value: 'medium'},
                { name: 'Hard', value: 'hard'}
            )
        )
        .addStringOption((option) =>
            option.setName("category").setDescription("Pick a category of trivia questions.").setRequired(false).addChoices(
              { name: 'General Knowledge', value: '9' },
              { name: 'History', value: '23' },
              { name: 'Geography', value: '22' },
              { name: 'Politics', value: '24' },
              { name: 'Mythology', value: '10' },
            )
        ),
    run: async ({ client, interaction }) => {
        const amountOfQuestions = interaction.options.getString("questions")
        const category = interaction.options.getString("category")
        const difficulty = interaction.options.getString("difficulty")
        if(category){
            axios(`https://opentdb.com/api.php?amount=${amountOfQuestions}&category=${category}&difficulty=${difficulty}`).then((response) => {
                const html = response.data;
                console.log(html);
            });

            return;
        }
        axios(`https://opentdb.com/api.php?amount=${amountOfQuestions}&difficulty=${difficulty}`).then((response) => {
            const html = response.data;
            console.log(html);

            response.data.results.forEach(async result => {
                const embed = new EmbedBuilder()
                    .setColor("#355E3B")
                    .setTitle(`"${result.question}"`)
                    .setFooter({ text: `${result.difficulty} - ${result.category}`})
                    .setDescription(`${result.incorrect_answers.join(", ")}, ${result.correct_answer}`)
                    .setTimestamp()
                    await interaction.channel.send({ embeds: [embed] });

                    const collector = interaction.channel.createMessageCollector({ time: 20_000 });
                    collector.on('collect', m => {
                        console.log('collected a msg')
                        if(m.content.toUpperCase() == result.correct_answer.toUpperCase()){
                            message.channel.send("CORRECT!")
                            return;
                        }
                    });
                    
                    collector.on('end', collected => {
                        console.log(`Collected ${collected.size} items`);
                        return;
                    });

            });
        });

    },
}