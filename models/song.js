const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Song = sequelize.define("Song", {
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  artist: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Song;
