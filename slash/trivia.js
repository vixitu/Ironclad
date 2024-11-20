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

        const url = category
          ? `https://opentdb.com/api.php?amount=${amountOfQuestions}&category=${category}&difficulty=${difficulty}`
          : `https://opentdb.com/api.php?amount=${amountOfQuestions}&difficulty=${difficulty}`;

        axios(url).then(async (response) => {
            const html = response.data;
            console.log(html);

            for(const result of response.data.results) {
                const embed = new EmbedBuilder()
                    .setColor("#355E3B")
                    .setTitle(`"${result.question}"`)
                    .setFooter({ text: `${result.difficulty} - ${result.category}`})
                    .setDescription(`||${result.incorrect_answers.join(", ")}, ${result.correct_answer}||`)
                    .setTimestamp()

                    await interaction.channel.send({ embeds: [embed] });

                    var correctAnswer = await waitForCorrectAnswer(interaction.channel, result.correct_answer);

                    if (!correctAnswer) {
                      await interaction.channel.send("Time's up! The correct answer was: " + result.correct_answer );
                    }

            }
        });

        async function waitForCorrectAnswer(channel, correctAnswer) {
          return new Promise((resolve) => {
            const filter = m => m.content.toUpperCase().includes(correctAnswer.toUpperCase());
            const collector = channel.createMessageCollector({ filter, time: 20_000 });

            collector.on("collect", (m) => {
                m.reply("✅ **Correct!** Well done! 🎉");
                collector.stop("answered");
                resolve(true);
            });

            collector.on("end", (_, reason) => {
                console.log(`Collected ${_.size}`)
              if (reason !== "answered") {
                resolve(false);
              }
            });
          });
        }

    },
}