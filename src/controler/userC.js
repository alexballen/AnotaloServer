const { User, Notes, Tokenemail } = require("../db.js");
const { templateConstans } = require("./constans.js");
const { emailSendProcess } = require("../services/emailServices.js");
const {
  SignUp,
  SignIn,
  signInGoogle,
  authGoogle,
  generatePassword,
  emailExists,
  generateToken,
  validToken,
  generateHash,
} = require("../services/authServices.js");

const baseURL = "https://anotalo.netlify.app";

const getAllUser = async (req, res) => {
  try {
    const allUser = await User.findAll({
      include: {
        model: Notes,
      },
    });

    res.status(200).json(allUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postSignUp = async (req, res) => {
  const workFactor = process.env.BCRYPT_WORK_FACTOR;
  try {
    const { name, email, password, image, isAdmin } = req.body;

    if (!name) {
      throw new Error("El campo nombre es obligatorio");
    }
    if (!email) {
      throw new Error("El campo correo es obligatorio");
    }
    if (!password) {
      throw new Error("El campo contraseña es obligatorio");
    }

    const userDataByBody = {
      name,
      email,
      password,
      image,
      isAdmin,
    };

    const registerUser = await SignUp(User, userDataByBody, workFactor);

    if (registerUser.message === "Registro exitoso") {
      const token = await generateToken(User, email, "24h");

      const subject = `Usuario: ${name} Email: ${email}`;
      const greeting = `Hola ${name} te damos la bienvenida a Anotalo, una app facil y practica para que guardes todos tus apuntes¡`;
      const message = `Tu registro ha sido exitoso, da click en el siguiente link para confirmar tu correo electronico¡ ${`${baseURL}/accountconfirmation/?token=${token}`}`;

      await emailSendProcess(
        email,
        subject,
        message,
        greeting,
        templateConstans.singIn
      );
    }

    res.status(200).json(registerUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postSendMail = async (req, res) => {
  try {
    const { email, subject, message, greeting } = req.body;

    if (email && subject && message) {
      await emailSendProcess(
        email,
        subject,
        message,
        greeting,
        templateConstans.singIn
      );

      res.status(200).json("Email enviado con exito¡");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingInGoogle = async (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const redirectUrl = process.env.REDIRECT_URI;
  const scope = process.env.SCOPE;

  try {
    const authGoogle = await signInGoogle(clientId, redirectUrl, scope);

    res.status(200).json(authGoogle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAccessTokenGoogle = async (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUrl = process.env.REDIRECT_URI;
  const workFactor = process.env.BCRYPT_WORK_FACTOR;
  const passwordLength = process.env.PASSWORD_LENGTH;
  const characters = process.env.GENERATE_PASSWORD;

  const { code, email, password } = req.body;

  try {
    if (!code) {
      if (!email) {
        throw new Error("El campo email es obligatorio");
      }
      if (!password) {
        throw new Error("El campo password es obligatorio");
      }

      const verifyIsValidated = await User.findOne({
        where: { email },
      });

      const validate = verifyIsValidated?.dataValues?.isValidated;

      if (verifyIsValidated === null) {
        throw new Error("Usuario no existe");
      }

      if (!validate) {
        throw new Error("Validar correo");
      }

      const userAuth = await SignIn(User, email, password);

      res.status(200).json(userAuth);
    }

    if (!email && !password) {
      if (!code) {
        throw new Error("No se recibio codigo de Autorizacion de Google");
      }
      const accessToken = await authGoogle(
        code,
        clientId,
        clientSecret,
        redirectUrl
      );

      const { name, email, picture, verified_email } = accessToken.getInfo;

      const emailSearch = await emailExists(User, email);

      if (!emailSearch) {
        const password = generatePassword(passwordLength, characters);

        const userDataByTokenGoogle = {
          name,
          email,
          password,
          image: picture,
          isValidated: true,
        };

        await SignUp(User, userDataByTokenGoogle, workFactor);

        const token = await generateToken(User, email);
        return res.status(200).json(token);
      }

      const token = await generateToken(User, email);
      res.status(200).json(token);
    }
  } catch (error) {
    if (error.message.includes("Error de autenticación")) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const verificationToken = async (req, res) => {
  const { token } = req.body;
  try {
    if (!token) {
      throw new Error("No se recibio Token");
    }

    const tokenValid = validToken(token);

    res.status(200).json(tokenValid);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("El usuario no existe en la base de datos");
    }

    // Encuentra todas las notas del usuario
    const userNotes = await user.getNotes();

    // Elimina cada nota individualmente
    for (const note of userNotes) {
      await note.destroy();
    }

    await User.destroy({
      where: { id: userId },
    });

    res.status(200).json({
      message: "Se eliminó el usuario exitosamente",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Ha ocurrido un error en deleteUser",
      error: error.message,
    });
  }
};

const tokenConfirmation = async (req, res) => {
  const token = req.query.token;

  try {
    const tokenValid = validToken(token);
    const userId = tokenValid.id;

    if (tokenValid) {
      const searchUser = await User.findOne({
        where: { id: userId },
      });

      if (searchUser) {
        await User.update({ isValidated: true }, { where: { id: userId } });
      }
    }

    res.status(200).json(tokenValid);
  } catch (error) {
    res.status(500).json({
      message: "Ha ocurrido un error en tokenConfirmation",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      throw new Error("El campo email es obligatorio");
    }

    const emailSearch = await emailExists(User, email);
    const name = emailSearch?.dataValues?.name;
    const userId = emailSearch?.dataValues?.id;

    if (!emailSearch) {
      res.status(500).json("Correo no exite");
    }

    if (emailSearch) {
      const token = await generateToken(User, email, "2h");

      const searchToken = await Tokenemail.findOne({
        where: { userId },
      });

      const tokenDb = searchToken?.dataValues?.token;

      if (!searchToken) {
        const dataToken = {
          userId,
          token,
        };

        await Tokenemail.create(dataToken);
      }

      const tokenValid = validToken(tokenDb);

      if (!tokenValid.expired) {
        res.status(200).json("Existe token vigente");
        return;
      }

      await Tokenemail.destroy({
        where: { userId },
      });

      const subject = `Usuario: ${name} Email: ${email}`;
      const greeting = `Hola ${name} has realizado una solicitud de recuperacion de contraseña¡`;
      const message = `Para restaurar la contraseña da click en este enlace y realiza el cambio, de lo contrario tu contraseña no se modificara¡ ${`${baseURL}/passwordresetconfirmation/?t=${token}`}`;

      await emailSendProcess(
        email,
        subject,
        message,
        greeting,
        templateConstans.singIn
      );
      res.status(200).json("Cambio de contraseña enviado");
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const passwordResetConfirmation = async (req, res) => {
  const workFactor = process.env.BCRYPT_WORK_FACTOR;
  const { password, token } = req.body;

  try {
    const tokenValid = validToken(token);
    const userId = tokenValid.id;

    const hashPassword = await generateHash(password, workFactor);

    if (!tokenValid.expired) {
      if (userId) {
        const searchUser = await User.findOne({
          where: { id: userId },
        });

        const searchToken = await Tokenemail.findOne({
          where: { userId },
        });

        if (searchUser && searchToken) {
          await User.update(
            { password: hashPassword },
            { where: { id: userId } }
          );

          await Tokenemail.destroy({
            where: { userId },
          });

          const passwordReset = { reset: true };
          res.status(200).json(passwordReset);
          return;
        } else {
          const usedToken = { used: true };
          res.status(504).json(usedToken);
          return;
        }
      }
    }

    res.status(500).json(tokenValid);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllUser,
  postSignUp,
  postSendMail,
  getSingInGoogle,
  getAccessTokenGoogle,
  verificationToken,
  resetPassword,
  passwordResetConfirmation,
  tokenConfirmation,
  deleteUser,
};
