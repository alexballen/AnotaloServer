const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("notes", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    importance: {
      type: DataTypes.ENUM("high", "medium", "low"),
      allowNull: false,
    },
  });
};
