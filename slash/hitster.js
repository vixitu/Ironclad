const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("@discordjs/builders");
const { Song } = require("../initModels");
const { fn } = require("sequelize");

const { dbClient } = require("../main.js");
const {
  EmbedBuilder,
  ButtonStyle,
  MessageComponentInteraction,
} = require("discord.js");
const { QueryType, useMainPlayer } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hitster")
    .setDescription("Hitster but on Discord!"),
  run: async ({ client, interaction }) => {
    await startNewHitster({ client, interaction });
  },
};

async function startNewHitster({ client, interaction }) {
  await getRandomSong().then((song) => {
    playSong({ client, interaction, song });
  });
}

async function getRandomSong() {
  try {
    const song = await Song.findOne({ order: fn("RANDOM") }); // Use sequelize.random() as a method
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

  if (!interaction.member.voice.channel) {
    await interaction.reply("Please join a Voice Channel to play Hitster! :3");
    return;
  }

  const queue = await client.player.nodes.create(interaction.guild);
  if (!queue.connection) await queue.connect(interaction.member.voice.channel);

  try {
    await queue.clear();
    await console.log("Cleared the queue.");
  } catch (e) {
    console.error(e);
  }

  let searchTerm = `${song.artist} - ${song.title}`;
  var result = await player.search(searchTerm, {
    requestedBy: interaction.user,
    searchEngine: QueryType.YOUTUBE_SEARCH,
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
      time: 120_000,
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
    }
  } catch (e) {
    console.error(e);
    await interaction.editReply({
      content: "Hitster timed out",
      components: [],
    });
  }
}
