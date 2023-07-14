const { Notes } = require("../db.js");
const { Op } = require("sequelize");
const cron = require("node-cron");

const task = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Se esta ejecutando el middleware");
    try {
      const currentDateTime = new Date();
      const formattedDateTime = `${
        currentDateTime.toISOString().split("T")[0]
      } ${currentDateTime.getHours()}:${currentDateTime.getMinutes()}:${currentDateTime.getSeconds()}`;
      console.log(currentDateTime);
      console.log(formattedDateTime);

      const notas = await Notes.findAll({
        where: {
          reminder: {
            [Op.eq]: formattedDateTime,
          },
        },
      });
      console.log(notas);

      /*    notas.forEach((nota) => {
        console.log("Enviar notificación para la nota:", nota);
      }); */
    } catch (error) {
      console.error("Error al realizar la consulta:", error);
    }
  });
};

task();

module.exports = { task };
