const { Notes } = require("../db.js");
const { Op } = require("sequelize");
const cron = require("node-cron");

const task = () => {
  cron.schedule("* * * * *", () => {
    console.log("Running a task every minute");
  });
};

module.exports = task;

/* // Define la tarea programada
cron.schedule("* * * * *", async () => {
  try {
    // Obtén la fecha y hora actual
    const currentDateTime = new Date();
    console.log(currentDateTime);

    // Realiza la consulta para obtener las notas cuya fecha y hora se haya cumplido
    const notas = await Notes.findAll({
      where: {
        reminder: {
          [Op.lte]: currentDateTime, // Obtén las notas cuya fecha sea menor o igual a la fecha y hora actual
        },
      },
    });

    // Procesa las notas encontradas
    notas.forEach((nota) => {
      // Envía la notificación al usuario o realiza la acción correspondiente
      console.log("Enviar notificación para la nota:", nota);
    });
  } catch (error) {
    console.error("Error al realizar la consulta:", error);
  }
});
 */
