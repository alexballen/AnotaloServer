const { User, Notes } = require("../db.js");
const { userConstans, templateConstans } = require("./constans.js");
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
      const token = await generateToken(User, email);

      const subject = `Usuario: ${name} Email: ${email}`;
      const greeting = `Hola ${name} te damos la bienvenida a Anotalo, una app facil y practica para que guardes todos tus apuntes¡`;
      const message = `Tu registro ha sido exitoso, da click en el siguiente link para confirmar tu correo electronico¡ ${`http://127.0.0.1:5173/accountconfirmation/?token=${token}`}`;

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
    console.log(error);
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
  console.log("Este es codigo de autorizacion de Google -------> ", code);

  try {
    if (!code) {
      if (!email) {
        throw new Error("El campo email es obligatorio");
      }
      if (!password) {
        throw new Error("El campo password es obligatorio");
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
    const searchUserId = await User.findOne({
      where: { id: userId },
    });

    if (searchUserId === null) {
      throw new Error("El usuario no existe en la base de datos");
    }

    await User.destroy({
      where: { id: userId },
    });

    res.status(200).json({
      message: "Se eliminó el usuario exitosamente",
      data: searchUserId,
    });
  } catch (error) {
    console.log(error);
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
    console.log(error);
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

    if (!emailSearch) {
      res.status(500).json("Correo no exite en la db");
    }
    if (emailSearch) {
      const token = await generateToken(User, email);

      const subject = `Usuario: ${name} Email: ${email}`;
      const greeting = `Hola ${name} has realizado una solicitud de recuperacion de contraseña¡`;
      const message = `Para restaurar la contraseña da click en este enlace y realiza el cambio, de lo contrario tu contraseña no se modificara¡ ${`http://127.0.0.1:5173/passwordresetconfirmation/?token=${token}`}`;

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
  }
};

const passwordResetConfirmation = async (req, res) => {
  const workFactor = process.env.BCRYPT_WORK_FACTOR;
  const { password, token } = req.body;

  try {
    const tokenValid = validToken(token);
    const userId = tokenValid.id;

    const hashPassword = await generateHash(password, workFactor);

    if (tokenValid) {
      const searchUser = await User.findOne({
        where: { id: userId },
      });

      if (searchUser) {
        await User.update(
          { password: hashPassword },
          { where: { id: userId } }
        );
      }
    }

    res.status(200).json(tokenValid);
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
