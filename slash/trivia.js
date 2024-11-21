const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const puppeteer = require("puppeteer");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Starts a trivia.")
    .addIntegerOption((option) =>
      option
        .setName("questions")
        .setDescription("Choose an amount of questions.")
        .setRequired(true)
        .setMaxValue(50)
        .setMinValue(1)
    )
    .addStringOption((option) =>
      option
        .setName("difficulty")
        .setDescription("Choose a difficulty.")
        .setRequired(true)
        .addChoices(
          { name: "Easy", value: "easy" },
          { name: "Medium", value: "medium" },
          { name: "Hard", value: "hard" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Pick a category of trivia questions.")
        .setRequired(false)
        .addChoices(
          { name: "General Knowledge", value: "9" },
          { name: "History", value: "23" },
          { name: "Geography", value: "22" },
          { name: "Politics", value: "24" },
          { name: "Mythology", value: "10" },
          { name: "Video Games", value: "15" },
          { name: "Board Games", value: "16" },
          { name: "Music", value: "12" },
          { name: "Film", value: "11" },
          { name: "Books", value: "10" },
          { name: "Sports", value: "21" },
          { name: "Art", value: "25" },
          { name: "Anime", value: "31" },
          { name: "Animals", value: "27" },
          { name: "Vehicles", value: "28" },
          { name: "Science & Nature", value: "17" },
        )
    )
    .addBooleanOption((option) =>
      option
        .setName("multiplechoice")
        .setDescription("Choose whether you want multiple choice or not.")
        .setRequired(false)
    ),
  run: async ({ client, interaction }) => {
    const amountOfQuestions = interaction.options.getInteger("questions");
    const category = interaction.options.getString("category");
    const difficulty = interaction.options.getString("difficulty");
    const multipleChoices = interaction.options.getBoolean("multiplechoice");
    console.log(multipleChoices);
    var correctAnswerCount = 0;

    await interaction.editReply(`Starting a game of trivia on ${difficulty} difficulty which will last for ${amountOfQuestions} rounds.`)

    const url = category
      ? `https://opentdb.com/api.php?amount=${amountOfQuestions}&category=${category}&difficulty=${difficulty}`
      : `https://opentdb.com/api.php?amount=${amountOfQuestions}&difficulty=${difficulty}`;

    axios(url).then(async (response) => {
      const html = response.data;
      console.log(html);

      for (const result of response.data.results) {
        const allAnswers = [...result.incorrect_answers, result.correct_answer];

        // Shuffle answers
        const shuffledAnswers = allAnswers
          .map((answer) => ({ sort: Math.random(), value: answer })) // Voeg een willekeurige sorteerwaarde toe
          .sort((a, b) => a.sort - b.sort) // Sorteer op de willekeurige waarde
          .map((item) => item.value); // Verwijder de sorteervelden


        // Get index of correct answer
        const correctIndex = shuffledAnswers.indexOf(result.correct_answer);

        const embed = new EmbedBuilder()
            .setColor("#355E3B")
            .setTitle(`"${result.question}"`)
            .setFooter({
              text: `${result.difficulty} - ${result.category}`,
            })
            .setTimestamp();


        const buttons = new ActionRowBuilder();

        // Add buttons for each answer
        shuffledAnswers.forEach((answer, index) => {
          buttons.addComponents(
              new ButtonBuilder()
                  .setCustomId(`answer_${index}`)
                  .setLabel(`${index + 1}`)
                  .setStyle(ButtonStyle.Primary)
          );
        });

        const formattedAnswers = shuffledAnswers
            .map((answer, index) => `${index + 1}. ${answer}`) // Add numbers to each answer
            .join("\n"); // Combine into a single string with line breaks

        let triviaMessage;
        if (multipleChoices) {
          embed.setDescription(formattedAnswers);
          triviaMessage = await interaction.channel.send({
            embeds: [embed],
            components: [buttons],
          })
        } else {
          triviaMessage = await interaction.channel.send({
            embeds: [embed],
          })
        }

        var correctAnswer = await waitForCorrectAnswer(
          interaction.channel,
          result.correct_answer,
          result.incorrect_answers,
            triviaMessage,
            correctIndex
        );

        if (!correctAnswer) {
          await interaction.channel.send(
            "Time's up! The correct answer was: " + result.correct_answer
          );
        }
      }
      // Finished all the questions
      interaction.channel.send(
        `Correct: ${correctAnswerCount} / ${amountOfQuestions}`
      );
    });

    

    async function waitForCorrectAnswer(channel, correctAnswer, wrongAnswers, triviaMessage, correctIndex) {
      return new Promise((resolve) => {
        const buttonCollector = triviaMessage.createMessageComponentCollector({ time: 20_000 })

        buttonCollector.on("collect", async (buttonInteraction) => {
          if(buttonInteraction.user.bot) return;
          const selectedAnswerIndex = parseInt(buttonInteraction.customId.split("_")[1]);

          if (selectedAnswerIndex === correctIndex) {
            correctAnswerCount++;
            await buttonInteraction.reply("✅ **Correct!** Well done! 🎉");
            buttonCollector.stop("answered");
            resolve(true);
            return;
          } else {
            await buttonInteraction.reply(
                `❌ **Wrong!** The correct answer was: ${correctAnswer}.`
            );
            buttonCollector.stop("wrong");
            resolve(true); // Ga verder naar de volgende vraag
            return;
          }
        });

        const collector = channel.createMessageCollector({ time: 20_000 });

        collector.on("collect", (m) => {
          if(m.author.bot) return;
          if (
            wrongAnswers.some((wrong) =>
              m.content.toUpperCase().includes(wrong.toUpperCase())
            )
          ) {
            // Als het antwoord fout is
            m.reply("❌ **Wrong!** Better luck next time! 😿");
            collector.stop("wrong");
            resolve(true); // Ga verder naar de volgende vraag
            return;
          }
          if (m.content.toUpperCase().includes(correctAnswer.toUpperCase())) {
            m.reply("✅ **Correct!** Well done! 🎉");
            correctAnswerCount++;
            collector.stop("answered");
            resolve(true);
            return;
          }
        });

        collector.on("end", (_, reason) => {
          console.log(`Collected ${_.size}`);
          if (reason !== "answered") {
            resolve(false);
          }
        });
      });
    }
  },
};
