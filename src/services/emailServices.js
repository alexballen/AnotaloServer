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

const createMailOptions = async (email, subject, message, template) => {
  try {
    const mailOptions = {
      from: process.env.AUTH_USER,
      to: email,
      subject,
      text: message,
      html: template,
    };
    return mailOptions;
  } catch (error) {
    console.log(error);
  }
};

const verifyTransporter = (transporter) => {
  return new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      error ? reject(error) : resolve(success);
    });
  });
};

const sendEmail = (transporter, mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      error ? reject(error) : resolve(info);
    });
  });
};

const emailSendProcess = async (
  email,
  subject,
  message,
  greeting,
  templateType,
  res
) => {
  const template = await renderTemplate(
    email,
    subject,
    message,
    greeting,
    templateType
  );

  const transporter = await createEmailTransporter();

  const mailOptions = await createMailOptions(
    email,
    subject,
    message,
    template
  );

  verifyTransporter(transporter)
    .then((success) => {
      console.log("El servidor esta listo", success);
      sendEmail(transporter, mailOptions)
        .then((success) => {
          console.log("Email enviado con exito", success);
          res.status(200).json({ message: "Email enviado con exito" });
        })
        .catch((error) => {
          console.log("No se puedo enviar el Email", error);
          res.status(500).json({ message: "No se puedo enviar el Email" });
        });
    })
    .catch((error) => {
      console.log("No hay conexión con el servidor", error);
      res.status(500).json("No hay conexión con el servidor");
    });
};

module.exports = {
  emailSendProcess,
};
