const { User } = require("../db.js");
const {
  emailExists,
  generateHash,
  validHash,
  generateToken,
  SignUp,
  SignIn,
} = require("../controler/services.js");
const bcrypt = require("bcryptjs");

const getAllUser = async (req, res) => {
  try {
    const allUser = await User.findAll();
    res.status(200).json(allUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Ha ocurrido un error getAllUser" });
  }
};

const postUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existe = await generateToken(email);

    /* const emailSearch = await emailExists(email);

    if (emailSearch) {
      return res.status(404).json("El correo ya existe");
    }

    const hashPassword = await generateHash(password);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
    }); */

    res.status(200).json(existe);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Ha ocurrido un error postUser" });
  }
};

module.exports = {
  getAllUser,
  postUser,
};
