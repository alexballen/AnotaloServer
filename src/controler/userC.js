const { User } = require("../db.js");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { userConstans, templateConstans } = require("./constans.js");
const { emailSendProcess } = require("../services/emailServices.js");
const {
  SignUp,
  SignIn,
  signInGoogle,
  googleAuthorizationCode,
  getAccessToken,
  getUserInformation,
  authGoogle,
  getErrorGoogle,
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
    const CLIENT_ID = process.env.CLIENT_ID;
    const REDIRECT_URI = process.env.REDIRECT_URI;
    const SCOPE = process.env.SCOPE;

    const authGoogle = await signInGoogle(CLIENT_ID, REDIRECT_URI, SCOPE);
    console.log(authGoogle);

    res.redirect(authGoogle);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

const getCodeAuthGoogle = async (req, res) => {
  try {
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const REDIRECT_URI = process.env.REDIRECT_URI;

    const obj = await authGoogle(req, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    console.log(obj);

    res.status(200).json("exito");
  } catch (error) {
    console.log(error);
  }
};

const getErrorAuthGoogle = (req, res) => {
  try {
    const authError = getErrorGoogle(req);
    console.log(authError);
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
  getErrorAuthGoogle,
};
