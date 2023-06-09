const { User, Notes } = require("../db.js");
const { userConstans, templateConstans } = require("./constans.js");
const { emailSendProcess } = require("../services/emailServices.js");
const {
  SignUp,
  SignIn,
  signInGoogle,
  authGoogle,
  generatePassword,
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
  try {
    const { name, email, password, image, isAdmin } = req.body;

    if (!name) {
      throw new Error("El campo name es obligatorio en --> postSignUp");
    }
    if (!email) {
      throw new Error("El campo email es obligatorio en --> postSignUp");
    }
    if (!password) {
      throw new Error("El campo password es obligatorio en --> postSignUp");
    }

    const userDataByBody = {
      name,
      email,
      password,
      image,
      isAdmin,
    };

    const registerUser = await SignUp(User, userDataByBody);
    res.status(200).json(registerUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new Error("El campo email es obligatorio en --> postSignIn");
    }
    if (!password) {
      throw new Error("El campo password es obligatorio en --> postSignIn");
    }

    const userAuth = await SignIn(User, email, password);
    res.status(200).json(userAuth);
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
    console.log(authGoogle);

    // Redirige a la URL de autorización de Google
    /* res.redirect(authGoogle); */
    res.status(200).json(authGoogle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAccessTokenGoogle = async (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUrl = process.env.REDIRECT_URI;

  try {
    const accessToken = await authGoogle(
      req,
      clientId,
      clientSecret,
      redirectUrl
    );
    const { name, email, picture, verified_email } = accessToken.getInfo;

    const passwordLength = process.env.PASSWORD_LENGTH;
    const password = generatePassword(passwordLength);

    const emailuser = "alex6@gmail.com";
    const userDataByTokenGoogle = {
      name,
      email: emailuser,
      password,
      image: picture,
    };

    const registerUser = await SignUp(User, userDataByTokenGoogle);

    res.status(200).json(registerUser);
  } catch (error) {
    if (error.message.includes("Error de autenticación")) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = {
  getAllUser,
  postSignUp,
  postSignIn,
  postSendMail,
  getSingInGoogle,
  getAccessTokenGoogle,
};
