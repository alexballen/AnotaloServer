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
    if (!email) {
      throw new Error("El campo email es obligatorio");
    }
    if (!subject) {
      throw new Error("El campo subject es obligatorio");
    }
    if (!message) {
      throw new Error("El campo message es obligatorio");
    }
    if (!greeting) {
      throw new Error("El campo greeting es obligatorio");
    }
    if (!templateType) {
      throw new Error("El campo templateType es obligatorio");
    }

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
    throw error;
  }
};

const createEmailTransporter = async () => {
  try {
    const serviceEnv = process.env.SERVICES;
    const hostEnv = process.env.HOST;
    const portEnv = process.env.PORT_TRANSPORTER;
    const secureEnv = process.env.SECURE;
    const userEnv = process.env.AUTH_USER;
    const passEnv = process.env.AUTH_PASS;

    if (!serviceEnv) {
      throw new Error("El campo SERVICES del archivo .env esta vacio");
    }
    if (!hostEnv) {
      throw new Error("El campo HOST del archivo .env esta vacio");
    }
    if (!portEnv) {
      throw new Error("El campo PORT_TRANSPORTER del archivo .env esta vacio");
    }
    if (!secureEnv) {
      throw new Error("El campo SECURE del archivo .env esta vacio");
    }
    if (!userEnv) {
      throw new Error("El campo AUTH_USER del archivo .env esta vacio");
    }
    if (!passEnv) {
      throw new Error("El campo AUTH_PASS del archivo .env esta vacio");
    }

    const transporter = await nodemailer.createTransport({
      service: serviceEnv,
      host: hostEnv,
      port: portEnv,
      secure: secureEnv,
      auth: {
        user: userEnv,
        pass: passEnv,
      },
    });
    return transporter;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const createMailOptions = async (email, subject, message, template) => {
  try {
    const userEnv = process.env.AUTH_USER;

    if (!email) {
      throw new Error("El campo email es obligatorio");
    }
    if (!subject) {
      throw new Error("El campo subject es obligatorio");
    }
    if (!message) {
      throw new Error("El campo message es obligatorio");
    }
    if (!template) {
      throw new Error("El campo template es obligatorio");
    }
    if (!userEnv) {
      throw new Error("El campo AUTH_USER del archivo .env esta vacio");
    }

    const mailOptions = {
      from: userEnv,
      to: email,
      subject,
      text: message,
      html: template,
    };
    return mailOptions;
  } catch (error) {
    console.log(error);
    throw error;
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
  templateType
) => {
  try {
    if (!email) {
      throw new Error("El campo email es obligatorio");
    }
    if (!subject) {
      throw new Error("El campo subject es obligatorio");
    }
    if (!message) {
      throw new Error("El campo message es obligatorio");
    }
    if (!greeting) {
      throw new Error("El campo greeting es obligatorio");
    }
    if (!templateType) {
      throw new Error("El campo templateType es obligatorio");
    }

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
        console.log("El servidor de correo esta listo", success);
        sendEmail(transporter, mailOptions)
          .then((success) => {
            console.log("Email enviado con exito", success);
          })
          .catch((error) => {
            throw new Error("No se puedo enviar el Email", error);
          });
      })
      .catch((error) => {
        throw new Error(
          "No hay conexión con el servidor de correo, verifica tus credenciales en tu archivo .env",
          error
        );
      });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  emailSendProcess,
};
