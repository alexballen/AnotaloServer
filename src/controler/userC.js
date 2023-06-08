const { User } = require("../db.js");
const { userConstans, templateConstans } = require("./constans.js");
const { emailSendProcess } = require("../services/emailServices.js");
const {
  SignUp,
  SignIn,
  signInGoogle,
  authGoogle,
} = require("../services/authServices.js");

const getAllUser = async (req, res) => {
  try {
    const allUser = await User.findAll();

    res.status(200).json(allUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postSignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (name && email && password) {
      const result = await SignUp(User, name, email, password, res);
      res.status(200).json(result);
      return;
    }

    res.status(500).json({ message: `${userConstans.incomplete_data}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email && password) {
      const result = await SignIn(User, email, password, res);
      res.status(200).json(result);
      return;
    }

    res.status(500).json({ message: `${userConstans.incomplete_data}` });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: `${userConstans.error_in_function} postSignIn` });
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

const getCodeAuthGoogle = async (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUrl = process.env.REDIRECT_URI;

  try {
    const obj = await authGoogle(req, clientId, clientSecret, redirectUrl);

    res.status(200).json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUser,
  postSignUp,
  postSignIn,
  postSendMail,
  getSingInGoogle,
  getCodeAuthGoogle,
};
