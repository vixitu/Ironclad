const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const puppeteer = require('puppeteer')
const axios = require('axios')
const cheerio = require('cheerio')
const { setTimeout } = require("timers/promises")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("trivia")
        .setDescription("Starts a trivia.")
        .addStringOption((option) =>
            option.setName("category").setDescription("Pick a category of trivia questions.").setRequired(false).addChoices(
              { name: 'Anxiety', value: 'anxiety' },
              { name: 'Change', value: 'change' },
              { name: 'Choice', value: 'choice' }
            )
        )
        .addStringOption((option) =>
            option.setName("questions").setDescription("Choose an amount of questions.").setRequired(false)
        ),
    run: async ({ client, interaction }) => {
        const amountOfQuestions = interaction.options.getString("questions")
        
          
        


    },
}