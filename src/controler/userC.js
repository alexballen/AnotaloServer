const { User } = require("../db.js");
const axios = require("axios");
const { userConstans, templateConstans } = require("./constans.js");
const { emailSendProcess } = require("../services/emailServices.js");
const {
  SignUp,
  SignIn,
  signInGoogle,
  googleAuthorizationCode,
  getAccessToken,
} = require("../services/authServices.js");

const getAllUser = async (req, res) => {
  try {
    const allUser = await User.findAll();
    res.status(200).json(allUser);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: `${userConstans.error_in_function} getAllUser` });
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
    console.log(error);
    res
      .status(500)
      .json({ message: `${userConstans.error_in_function} postSignUp` });
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
  try {
    const authGoogle = await signInGoogle();
    console.log(authGoogle);

    res.redirect(authGoogle);
  } catch (error) {
    console.log(error);
  }
};

const getCodeAuthGoogle = async (req, res) => {
  try {
    const code = await googleAuthorizationCode(req);
    console.log(code);

    const tokenAccess = await getAccessToken(code);
    console.log(tokenAccess);

    /* const accessToken = tokenAccess.data.access_token;
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Aquí puedes utilizar los datos de usuario en userInfoResponse.data
    const { id, email, name, picture } = userInfoResponse.data;

    console.log(id, email, name, picture); */

    res.status(200).json(code);
  } catch (error) {
    console.log(error);
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
