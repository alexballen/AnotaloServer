const { User } = require("../db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  correo_ya_existe,
  correo_no_existe,
  ha_ocurrido_un_error,
} = require("./errors.js");

const emailExists = async (email) => {
  try {
    const emailSearch = await User.findOne({
      where: { email },
    });

    return emailSearch ? emailSearch : false;
  } catch (error) {
    console.log(error);
    return { error: `${ha_ocurrido_un_error} emailExists` };
  }
};

const generateHash = async (password) => {
  try {
    const workFactor = parseInt(process.env.BCRYPT_WORK_FACTOR);
    const hashPassword = await bcrypt.hash(password, workFactor);
    return hashPassword;
  } catch (error) {
    console.log(error);
    return { error: `${ha_ocurrido_un_error} generateHash` };
  }
};

const validHash = async (password, passwordHash) => {
  try {
    const validHashPassword = await bcrypt.compare(password, passwordHash);
    return validHashPassword;
  } catch (error) {
    console.log(error);
    return { error: `${ha_ocurrido_un_error} validHash` };
  }
};

const generateToken = async (email) => {
  try {
    const emailSearch = await emailExists(email);

    const user = {
      id: emailSearch.id,
      name: emailSearch.name,
      email: emailSearch.email,
    };

    if (emailSearch) {
      const token = await jwt.sign(user, process.env.SECRET_TOKEN);
      return token;
    }

    return emailSearch;
  } catch (error) {
    console.log(error);
    return { error: `${ha_ocurrido_un_error} generateToken` };
  }
};

const SignUp = async (name, email, password) => {
  try {
    const emailSearch = await emailExists(email);

    if (emailSearch) {
      return { error: `${correo_ya_existe}` };
    }

    const hashPassword = await generateHash(password);

    const createUser = await User.create({
      name,
      email,
      password: hashPassword,
    });

    return createUser;
  } catch (error) {
    console.log(error);
    return { error: `${ha_ocurrido_un_error} SignUp` };
  }
};

const SignIn = async (email, password) => {
  try {
    const emailSearch = await emailExists(email);

    if (!emailSearch) {
      return { error: correo_no_existe };
    }

    const validHashPassword = await validHash(
      password,
      emailSearch.dataValues.password
    );

    if (validHashPassword) {
      const token = await generateToken(email);
      return token;
    }

    return validHashPassword;
  } catch (error) {
    console.log(error);
    return { error: `${ha_ocurrido_un_error} SignIn` };
  }
};

module.exports = {
  emailExists,
  generateHash,
  validHash,
  generateToken,
  SignUp,
  SignIn,
};
