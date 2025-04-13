const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("@discordjs/builders");
const { Song, HitsterLeaderboard } = require("../initModels");
const { fn } = require("sequelize");
const stringSimilarity = require("string-similarity");
const { dbClient, user } = require("../main.js");
const {
  EmbedBuilder,
  ButtonStyle,
  MessageComponentInteraction,
} = require("discord.js");
const { QueryType, useMainPlayer } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hitster")
    .setDescription("Hitster but on Discord!")
    .addBooleanOption((option) =>
      option
        .setName("stop")
        .setDescription("Stops the current game of Hitster!")
    )
    .addBooleanOption((option) =>
      option
        .setName("skip")
        .setDescription("Skips the current song playing in Hitster!")
    ),
  run: async ({ client, interaction }) => {
    if (interaction.options.getBoolean("stop")) {
      await StopHitster(interaction, queue);
      return;
    } else if (interaction.options.getBoolean("skip")) {
      await interaction.editReply(
        `The song was **${song.title}** by **${song.artist}** released in **${song.year}**`
      );

      await startNewHitster({ client, interaction });
      return;
    }

    await startNewHitster({ client, interaction });
  },
};

var queue = null;
var song = null;

async function startNewHitster({ client, interaction }) {
  if (!interaction.member.voice.channel) {
    await interaction.editReply(
      "Please join a Voice Channel to play Hitster! :3"
    );
    return;
  }

  await getRandomSong().then((song) => {
    playSong({ client, interaction, song });
  });
  try {
    await populateDatabase(interaction.member.voice.channel);
  } catch (e) {
    await interaction.editReply("Are you sure you are in a voice channel?");
    console.error(e);
  }
}

async function getRandomSong() {
  try {
    song = await Song.findOne({ order: fn("RANDOM") }); // Use sequelize.random() as a method
    return song; // Return the song directly
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function playSong({ client, interaction, song }) {
  const serverID = interaction.guildId;
  const db = dbClient.db("PanzerDB");
  const collection = db.collection(`music_${serverID}`);
  const player = useMainPlayer();

  queue = await client.player.nodes.create(interaction.guild);
  if (!queue.connection) await queue.connect(interaction.member.voice.channel);

  try {
    await queue.clear();
    await console.log("Cleared the queue.");
  } catch (e) {
    console.error(e);
  }

  let searchTerm = `${song.artist} - ${song.title}`;
  console.log(searchTerm);
  var result = await player.search(searchTerm, {
    requestedBy: interaction.user,
    searchEngine: QueryType.AUTO_SEARCH,
  });

  const track = result.tracks[0];
  await queue.insertTrack(track, 0);
  if (queue.node.queue.currentTrack != null) {
    try {
      await queue.node.skip();
      await console.log("Skipped the previous song.");
    } catch (e) {
      console.error(e);
    }
  }

  if (!queue.node.isPlaying()) await queue.node.play();

  await waitForAnswers({
    client: client,
    interaction: interaction,
    channel: interaction.channel,
    song: song,
  });

  const embed = new EmbedBuilder()
    .setColor("#FF0000")
    .setTitle(`Start guessing!`)
    .setDescription(`Goodluck...`);

  const stop = new ButtonBuilder()
    .setCustomId("stop")
    .setLabel("Stop Hitster")
    .setStyle(ButtonStyle.Danger);
  const next = new ButtonBuilder()
    .setCustomId("next")
    .setLabel("Next Song")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(stop, next);

  const response = await interaction.editReply({
    embeds: [embed],
    components: [row],
    withResponse: true,
  });
  console.log(
    `Playing ${song.title} by ${song.artist} released in ${song.year}`
  );
  const collectorFilter = (i) => i.user.id === interaction.user.id;

  try {
    const confirmation = await response.awaitMessageComponent({
      filter: collectorFilter,
      time: 180_000,
    });

    if (confirmation.customId === "next") {
      await startNewHitster({ client, interaction });
      await confirmation.update({
        content: `The song was **${song.title}** by **${song.artist}** released in **${song.year}**`,
        components: [],
      });
    } else if (confirmation.customId === "stop") {
      await confirmation.update({
        content: "Hitster cancelled",
        components: [],
      });
      await StopHitster(interaction, queue);
    }
  } catch (e) {
    console.log("time has ran out.");
    await interaction.editReply({
      content: "Hitster timed out",
      components: [],
    });
  }
}

async function waitForAnswers({ client, interaction, channel, song }) {
  const filter = (response) => {
    return !response.author.bot;
  };

  const collector = channel.createMessageCollector({
    filter,
    time: 180_000,
  });

  collector.on("collect", async (message) => {
    const artist = song.artist.toLowerCase();
    const title = song.title.toLowerCase();
    const year = song.year.toString();

    const titleartist = `${title} ${artist}`;

    const similarity = stringSimilarity.compareTwoStrings(
      titleartist.toLocaleLowerCase(),
      message.content.toLowerCase()
    );

    console.log("Similarity: ", similarity);

    // Check for matches
    const TitleArtistMatch = similarity >= 0.85; // Adjust the threshold as needed
    const yearMatch = message.content.toLowerCase().includes(year);
    // Require both artist and title to match, or the year to match exactly
    if (TitleArtistMatch || yearMatch) {
      await message.react("✅");
      await message.reply(
        `Correct! The song was **${song.title}** by **${song.artist}** released in **${song.year}**`
      );
      await collector.stop();
      startNewHitster({ client, interaction: interaction });
      updateScore(interaction, message.author.id);
      return;
    } else if (similarity >= 0.55) {
      await message.react("🤔");
    } else {
      await message.react("❌");
    }
  });

  collector.on("end", async (collected) => {
    if (collected.size === 0) {
      await channel.send(
        `Time's up! The song was **${song.title}** by **${song.artist}** released in **${song.year}**`
      );
    }
  });
}

async function populateDatabase(voice) {
  await voice.members.forEach((member) => {
    if (member.user.bot) return; // Skip bots
    const id = member.id;
    HitsterLeaderboard.findOrCreate({
      where: { discordUserId: id },
      defaults: { score: 0 },
    })
      .then(([user, created]) => {
        if (created) {
          console.log(`User ${id} added to the database.`);
        } else {
          console.log(`User ${id} already exists in the database.`);
        }
      })
      .catch((error) => {
        console.error("Error adding user to the database:", error);
      });
  });
}

async function updateScore(interaction, userId) {
  const [user, created] = await HitsterLeaderboard.findOrCreate({
    where: { discordUserId: userId },
    defaults: { score: 0 },
  });

  if (!created) {
    user.score += 1;
    await user.save();
  }
}

async function SendLeaderboardEmbed(channel) {
  const leaderboardEmbed = new EmbedBuilder()
    .setColor("#FF0000")
    .setTitle(`Leaderboard!`)
    .setDescription(`Here are the top players:`)
    .setTimestamp()
    .setFooter({
      text: "Hitster Leaderboard",
    })
    .addFields(
      await HitsterLeaderboard.findAll({
        order: [["score", "DESC"]],
        limit: 5,
      }).then((users) => {
        return users.map((user, index) => ({
          name: `Number ${index + 1}.`,
          value: `<@${user.discordUserId}> with a score of ${user.score}!`,
          inline: true,
        }));
      })
    );

  await channel.send({
    embeds: [leaderboardEmbed],
  });
}

async function StopHitster(interaction, queue) {
  await queue.node.stop();
  console.log("Hitster stopped.");
  await SendLeaderboardEmbed(interaction.channel);
  await HitsterLeaderboard.destroy({ where: {} })
    .then(() => {
      console.log("Leaderboard cleared.");
    })
    .catch((error) => {
      console.error("Error clearing leaderboard:", error);
    });
}
