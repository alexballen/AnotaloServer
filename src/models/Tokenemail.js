const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("tokenemail", {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    token: {
      type: DataTypes.TEXT,
    },
  });
};
