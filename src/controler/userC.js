const { User } = require("../db.js");
const { userConstans, templateConstans } = require("./constans.js");
const { emailSendProcess } = require("../services/emailServices.js");
const { SignUp, SignIn } = require("../services/authServices.js");

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

module.exports = {
  getAllUser,
  postSignUp,
  postSignIn,
  postSendMail,
};
