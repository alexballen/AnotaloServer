const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
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

const signInGoogle = async () => {
  try {
    const CLIENT_ID =
      "851275819483-94ma132th8ejk8fdstkhtur9e0ap3stg.apps.googleusercontent.com";
    const CLIENT_SECRET = "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";
    const REDIRECT_URI = "http://localhost:3001/auth/google/callback";

    const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=profile email`;

    return authorizationUrl;
  } catch (error) {
    console.log(error);
  }
};

const googleAuthorizationCode = (req) => {
  try {
    const { code } = req.query;
    return code || null;
  } catch (error) {
    console.log(error);
  }
};

const getAccessToken = async (code) => {
  try {
    const CLIENT_ID =
      "851275819483-94ma132th8ejk8fdstkhtur9e0ap3stg.apps.googleusercontent.com";
    const CLIENT_SECRET = "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";
    const REDIRECT_URI = "http://localhost:3001/auth/google/callback";
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }
    );

    return tokenResponse.data;
  } catch (error) {
    console.log(error);
  }
};

const otrocodigo = async () => {
  const accessToken = tokenResponse.data.access_token;
  console.log(accessToken);

  const userInfoResponse = await axios.get(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  console.log(userInfoResponse);

  // Aquí puedes utilizar los datos de usuario en userInfoResponse.data
  const { id, email, name, picture } = userInfoResponse.data;
  // Realiza acciones adicionales con los datos del usuario, como crear una sesión, guardar en la base de datos, etc.
  // Redirige al usuario a la página de inicio o a donde desees
  res.redirect("/dashboard");
};

module.exports = {
  SignUp,
  SignIn,
  signInGoogle,
  googleAuthorizationCode,
  getAccessToken,
};
