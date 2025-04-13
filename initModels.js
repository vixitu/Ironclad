const sequelize = require("./database");
const Song = require("./models/song");
const HitsterLeaderboard = require("./models/hitsterleaderboard");

const initModels = async () => {
  await sequelize.sync();
  console.log("Database & tables created!");
};

module.exports = { initModels, Song, HitsterLeaderboard };
