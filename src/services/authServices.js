const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authConstans } = require("../controler/constans.js");

const emailExists = async (UserDb, email) => {
  try {
    const emailSearch = await UserDb.findOne({
      where: { email },
    });

    return emailSearch ? emailSearch : false;
  } catch (error) {
    console.log(error);
    return { error: `${authConstans.error_in_function} emailExists` };
  }
};

const generateHash = async (password) => {
  try {
    const workFactor = parseInt(process.env.BCRYPT_WORK_FACTOR);
    const hashPassword = await bcrypt.hash(password, workFactor);
    return hashPassword;
  } catch (error) {
    console.log(error);
    return { error: `${authConstans.error_in_function} generateHash` };
  }
};

const validHash = async (password, passwordHash) => {
  try {
    const validHashPassword = await bcrypt.compare(password, passwordHash);
    return validHashPassword;
  } catch (error) {
    console.log(error);
    return { error: `${authConstans.error_in_function} validHash` };
  }
};

const generateToken = async (UserDb, email) => {
  try {
    const emailSearch = await emailExists(UserDb, email);

    if (emailSearch) {
      const user = {
        id: emailSearch.id,
        name: emailSearch.name,
        email: emailSearch.email,
      };

      const token = await jwt.sign(user, process.env.SECRET_TOKEN);

      return token;
    }

    return emailSearch;
  } catch (error) {
    console.log(error);
    return { error: `${authConstans.error_in_function} generateToken` };
  }
};

const userDbCreate = async (UserDb, name, email, hashPassword) => {
  try {
    const createUser = await UserDb.create({
      name,
      email,
      password: hashPassword,
    });
    return createUser;
  } catch (error) {
    console.log(error);
    return { error: `${authConstans.error_in_function} userDbCreate` };
  }
};

const SignUp = async (UserDb, name, email, password, res) => {
  try {
    const emailSearch = await emailExists(UserDb, email);

    if (emailSearch) {
      res.status(500).json({ error: `${authConstans.email_exists}` });
      return;
    }

    const hashPassword = await generateHash(password);

    const createUser = await userDbCreate(UserDb, name, email, hashPassword);

    res.status(200).json(createUser);
  } catch (error) {
    console.log(error);
  }
};

const SignIn = async (UserDb, email, password, res) => {
  try {
    const emailSearch = await emailExists(UserDb, email);

    if (!emailSearch) {
      return { error: `${authConstans.email_does_not_exist}` };
    }

    const validHashPassword = await validHash(
      password,
      emailSearch.dataValues.password
    );

    if (validHashPassword) {
      const token = await generateToken(UserDb, email);
      return token;
    }

    res.status(500).json({ message: `${authConstans.valid_hash}` });
  } catch (error) {
    console.log(error);
    return { error: `${authConstans.error_in_function} SignIn` };
  }
};

module.exports = {
  SignUp,
  SignIn,
};
