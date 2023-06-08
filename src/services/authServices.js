const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { URLSearchParams } = require("url");
const { authConstans } = require("../controler/constans.js");

const emailExists = async (userDb, email) => {
  try {
    if (!userDb) {
      throw new Error("El campo userDb es obligatorio");
    }

    if (!email) {
      throw new Error("El campo email es obligatorio");
    }

    const emailSearch = await userDb.findOne({
      where: { email },
    });

    return emailSearch;
  } catch (error) {
    throw error;
  }
};

const generateHash = async (password) => {
  try {
    if (!password) {
      throw new Error("El campo password es obligatorio");
    }
    if (password.length < 8) {
      throw new Error("El password debe tener minimo 8 caracteres");
    }

    const workFactor = parseInt(process.env.BCRYPT_WORK_FACTOR);

    if (!workFactor) {
      throw new Error(
        "No has generado el workFactor, recuerda definirlo en tus variables de entorno"
      );
    }
    if (workFactor < 10) {
      throw new Error(
        "El valor de workFactor debe ser minimo 10 para cumplir con buenas practicas de seguridad, un numero mayor podria demandarle rendimiento a la app"
      );
    }
    const hashPassword = await bcrypt.hash(password, workFactor);

    return hashPassword;
  } catch (error) {
    throw error;
  }
};

const validHash = async (password, passwordHash) => {
  try {
    if (!password) {
      throw new Error("El campo password es obligatorio");
    }
    if (!passwordHash) {
      throw new Error("El campo passwordHash es obligatorio");
    }
    if (password.length < 8) {
      throw new Error("El password debe tener minimo 8 caracteres");
    }

    const validHashPassword = await bcrypt.compare(password, passwordHash);
    console.log(validHashPassword);
    return validHashPassword;
  } catch (error) {
    throw error;
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

const SignUp = async (userDb, name, email, password, res) => {
  try {
    const emailSearch = await emailExists(userDb, email);

    if (emailSearch) {
      throw new Error("Correo ya existe en la db");
    }

    const hashPassword = await generateHash(password);

    if (!hashPassword) {
      throw new Error(
        "Problemas al hashear el password, verifica si tienes instalado bcryptjs"
      );
    }

    const createUser = await userDbCreate(userDb, name, email, hashPassword);

    res.status(200).json(createUser);
  } catch (error) {
    throw error;
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

const verifyClientIdCredential = async (authorizationUrl) => {
  try {
    //Se guarda el objeto que devuelve la ejecucion de la funcion signInGoogle
    const getAuthorizationUrl = await axios.get(authorizationUrl);

    //Se guarda lo que contiene responseUrl que esta dentro de getAuthorizationUrl
    const getUrlError = getAuthorizationUrl.request.res.responseUrl;

    //Con el metodo URLSearchParams elimino todo lo que esta antes del query urlError
    const urlParameters = new URLSearchParams(
      getUrlError.substring(urlError.indexOf("?") + 1)
    );

    //Me guardo con el metodo get el valor del query authError
    const authError = urlParameters.get("authError");

    let decodedError, cleanDecodedError;

    if (authError) {
      //Decodifico el valor de authError a utf-8
      decodedError = Buffer.from(authError, "base64").toString("utf-8");

      //Elimino los caracteres especiales, dejo solo el texto
      cleanDecodedError = decodedError.replace(/[^\x20-\x7E]/g, "");
    }

    //Si la credenciales de CLIENT_ID no son validas, devuelve un false como confirmacion
    if (authError) {
      console.log("Credencial CLIENT_ID validada, es incorrecta");
      throw new Error(cleanDecodedError);
    }
  } catch (error) {
    //Si las credenciales de CLIENT_ID son correctas devuelve un true como confirmacion y el codigo de error
    throw error;
  }
  console.log("Credencial CLIENT_ID validada, es correcta");
  return true;
};

const signInGoogle = async (clientId, redirectUrl, scope) => {
  try {
    if (!clientId) {
      throw new Error("El clientId no puede estar vacío");
    }

    if (!redirectUrl) {
      throw new Error("El redirectUrl no puede estar vacío");
    }

    if (!scope) {
      throw new Error("El scope no puede estar vacío");
    }

    const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&scope=${encodeURIComponent(
      scope
    )}`;

    await verifyClientIdCredential(authorizationUrl);

    return authorizationUrl;
  } catch (error) {
    throw error;
  }
};

const googleAuthorizationCode = (req) => {
  try {
    const { code } = req.query;
    if (!code) {
      throw new Error("No hay codigo");
    }
    return code;
  } catch (error) {
    throw error;
  }
};

const getAccessToken = async (code, clientId, clientSecret, redirectUrl) => {
  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUrl,
        grant_type: "authorization_code",
      }
    );

    return tokenResponse.data;
  } catch (error) {
    throw error;
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
    throw error;
  }
};

const authGoogle = async (req, clientId, clientSecret, redirectUrl) => {
  try {
    //El codigo se recibe si la funcion signInGoogle se completa sin errores, google Auth devuelve un codigo de confirmacion y autorizacion para proceder con este a solicitar el token.
    const code = googleAuthorizationCode(req);

    //Se solicita el token con las credenciales code, clientId, clientSecret, redirectUrl, si son correctas las credenciales se genera el token con la informacion del usurio logueado.
    const accessToken = await getAccessToken(
      code,
      clientId,
      clientSecret,
      redirectUrl
    );

    //Se decodifica del token el access_token, nos muestra la info del usuario logueado.
    const getInfo = await getUserInformation(accessToken.access_token);

    //Se decodifica del token el id_token, nos muestra la info del usuario logueado.
    const decodedToken = jwt.decode(accessToken.id_token);

    return {
      code,
      accessToken,
      getInfo,
      decodedToken,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  SignUp,
  SignIn,
  signInGoogle,
  authGoogle,
  emailExists,
};
