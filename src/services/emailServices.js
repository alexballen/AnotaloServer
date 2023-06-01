const nodemailer = require("nodemailer");
const ejs = require("ejs");

const renderTemplate = async (
  email,
  subject,
  message,
  greeting,
  templateType
) => {
  try {
    const template = await ejs.renderFile(
      __dirname + `/../views/${templateType}`,
      {
        email,
        subject,
        message,
        greeting,
      }
    );
    return template;
  } catch (error) {
    console.log(error);
  }
};

const createEmailTransporter = async () => {
  try {
    const transporter = await nodemailer.createTransport({
      service: process.env.SERVICES,
      host: process.env.HOST,
      port: process.env.PORT_TRANSPORTER,
      secure: process.env.SECURE,
      auth: {
        user: process.env.AUTH_USER,
        pass: process.env.AUTH_PASS,
      },
    });
    return transporter;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  renderTemplate,
  createEmailTransporter,
};
