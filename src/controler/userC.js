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
      throw new Error("El campo name es obligatorio");
    }
    if (!email) {
      throw new Error("El campo email es obligatorio");
    }
    if (!password) {
      throw new Error("El campo password es obligatorio");
    }

    const userDataByBody = {
      name,
      email,
      password,
      image,
      isAdmin,
    };

    const registerUser = await SignUp(User, userDataByBody, workFactor);
    res.status(200).json(registerUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postSendMail = async (req, res) => {
  try {
    const { email, subject, message, greeting } = req.body;

    if (email && subject && message) {
      const result = emailSendProcess(
        email,
        subject,
        message,
        greeting,
        templateConstans.singIn,
        res
      );

      return result;
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: `${userConstans.error_in_function} postSendMail` });
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
        };

        await SignUp(User, userDataByTokenGoogle, workFactor);

        const token = await generateToken(User, email);
        res.status(200).json(token);
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

module.exports = {
  getAllUser,
  postSignUp,
  postSendMail,
  getSingInGoogle,
  getAccessTokenGoogle,
  verificationToken,
};
