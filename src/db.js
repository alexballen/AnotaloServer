require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { DB_USER, DB_PASSWORD, DB_HOST, DB_DEPLOY } = process.env;

const sequelize = new Sequelize(
  `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/ecom`,
  {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
  }
);

/* const sequelize = new Sequelize(DB_DEPLOY, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
}); */

const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring

const {
  Game_type,
  Gift_place,
  Game_type_data,
  Gift_place_data,
  Punishment,
  Gift_product,
  Punishment_data,
  Gift_product_data,
} = sequelize.models;

Game_type.belongsToMany(Gift_place, { through: "gametype_giftplace" });
Gift_place.belongsToMany(Game_type, { through: "gametype_giftplace" });

Game_type_data.belongsToMany(Gift_place_data, {
  through: "gametypedata_giftplacedata",
});
Gift_place_data.belongsToMany(Game_type_data, {
  through: "gametypedata_giftplacedata",
});

Game_type.belongsToMany(Punishment, { through: "gametype_punishment" });
Punishment.belongsToMany(Game_type, { through: "gametype_punishment" });

Game_type_data.belongsToMany(Punishment_data, {
  through: "gametypedata_punishmentdata",
});
Punishment_data.belongsToMany(Game_type_data, {
  through: "gametypedata_punishmentdata",
});

Gift_place_data.hasMany(Gift_product_data, { foreignKey: "giftPlaceId" });

Gift_place.hasMany(Gift_product);

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
