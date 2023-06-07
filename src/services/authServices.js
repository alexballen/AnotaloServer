const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const { URLSearchParams } = require("url");
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

const verifyClientIdCredential = async (url) => {
  try {
    //Extraigo la url que me pasa la funcion signInGoogle
    const response = await axios.get(url);

    //Guardo en una variable lo que me devuleve el responseUrl
    const urlError = response.request.res.responseUrl;

    //Con el metodo URLSearchParams elimino todo lo que esta antes del query
    const params = new URLSearchParams(
      urlError.substring(urlError.indexOf("?") + 1)
    );

    //Me guardo con el metodo get el valor del query authError
    const authError = params.get("authError");

    //Decodifico el valor de authError a utf-8
    const decodedError = Buffer.from(authError, "base64").toString("utf-8");

    //Elimino los caracteres que especiales, dejos solo el texto
    const cleanDecodedError = decodedError.replace(/[^\x20-\x7E]/g, "");

    //Si la credenciales de CLIENT_ID no son validas, devuelve un false como confirmacion
    if (authError) {
      console.log(cleanDecodedError);
      return false;
    }
  } catch (error) {
    //Si las credenciales de CLIENT_ID son correctas devuelve un true como confirmacion y el codigo de error
    console.log("Credencial CLIENT_ID validada, es correcta");
  }
  return true;
};

const signInGoogle = async (CLIENT_ID, REDIRECT_URI, SCOPE) => {
  if (!CLIENT_ID || !REDIRECT_URI || !SCOPE) {
    return new Error("Debes ingresar todas las variables de entorno");
  }

  const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(
    SCOPE
  )}`;

  const result = await verifyClientIdCredential(authorizationUrl);

  if (!result) {
    return new Error("Credencial CLIENT_ID validada, es incorrecta");
  }

  return authorizationUrl;
};

const googleAuthorizationCode = (req) => {
  try {
    const { code } = req.query;
    return code;
  } catch (error) {
    console.log(error);
  }
};

const getAccessToken = async (code, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI) => {
  try {
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

const getUserInformation = async (accessToken) => {
  try {
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return userInfoResponse.data;
  } catch (error) {
    console.log(error);
  }
};

const authGoogle = async (req, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI) => {
  try {
    console.log("se inicio este servicio");
    const code = googleAuthorizationCode(req);
    if (code) {
      console.log(code);
    } else {
      console.log(
        "Verificar las credenciales CLIENT_ID,CLIENT_SECRET y REDIRECT_URI"
      );
    }

    const accessToken = await getAccessToken(
      code,
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    const getInfo = await getUserInformation(accessToken.access_token);

    const decodedToken = jwt.decode(accessToken.id_token);

    return {
      code,
      accessToken,
      getInfo,
      decodedToken,
    };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  SignUp,
  SignIn,
  signInGoogle,
  googleAuthorizationCode,
  getAccessToken,
  getUserInformation,
  authGoogle,
};
