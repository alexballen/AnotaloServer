const { Notes, User } = require("../db.js");
const { Op } = require("sequelize");
const { templateConstans } = require("../controler/constans.js");
const { emailSendProcess } = require("./emailServices.js");
const cron = require("node-cron");
const dayjs = require("dayjs");

const notesReminder = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const currentDateTime = dayjs();
      const formattedDateTime = currentDateTime.format("YYYY-MM-DD HH:mm:ss");

      const searchNotes = await Notes.findAll({
        where: {
          reminder: {
            [Op.eq]: formattedDateTime,
          },
        },
        include: {
          model: User,
        },
      });

      const subject = searchNotes[0]?.users[0]?.dataValues?.name;
      const greeting = "Recordatorio Anotalo...";

      searchNotes.forEach((note) => {
        const email = note?.dataValues?.users[0]?.dataValues?.email;
        const message = note?.dataValues?.title;

        const emailReply = emailSendProcess(
          email,
          subject,
          message,
          greeting,
          templateConstans.singIn
        );
        return emailReply;
      });
    } catch (error) {
      console.error("Error al realizar la consulta: ", error);
    }
  });
};

module.exports = { notesReminder };
