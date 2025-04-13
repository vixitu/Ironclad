const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const HitsterLeaderboard = sequelize.define("HitsterLeaderboard", {
  discordUserId: {
    type: DataTypes.TEXT,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = HitsterLeaderboard;
