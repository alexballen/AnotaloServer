const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { URLSearchParams } = require("url");
const { authConstans } = require("../controler/constans.js");

const emailExists = async (userDb, email) => {
  try {
    if (!userDb) {
      throw new Error("El campo userDb es obligatorio en --> emailExists");
    }

    if (!email) {
      throw new Error("El campo email es obligatorio en --> emailExists");
    }

    const emailSearch = await userDb.findOne({
      where: { email },
    });

    return emailSearch;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const generateHash = async (password) => {
  try {
    if (!password) {
      throw new Error("El campo password es obligatorio en --> generateHash");
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
    console.log(error);
    throw error;
  }
};

const validHash = async (password, passwordHash) => {
  try {
    if (!password) {
      throw new Error("El campo password es obligatorio en --> validHash");
    }
    if (!passwordHash) {
      throw new Error("El campo passwordHash es obligatorio en --> validHash");
    }
    if (password.length < 8) {
      throw new Error("El password debe tener minimo 8 caracteres");
    }

    const validHashPassword = await bcrypt.compare(password, passwordHash);

    return validHashPassword;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const generateToken = async (userDb, email) => {
  try {
    if (!userDb) {
      throw new Error("El campo userDb es obligatorio en --> generateToken");
    }
    if (!email) {
      throw new Error("El campo email es obligatorio --> generateToken");
    }

    const emailSearch = await emailExists(userDb, email);

    if (emailSearch) {
      const { id, name, email } = emailSearch.dataValues;
      const user = {
        id,
        name,
        email,
      };
      const token = await jwt.sign(user, process.env.SECRET_TOKEN);
      return token;
    }

    throw new Error("Correo no existe en la db");
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const userDbCreate = async (userDb, userDataObject) => {
  const { name, email, password } = userDataObject;
  try {
    if (!userDb) {
      throw new Error("El campo userDb es obligatorio en --> userDbCreate");
    }
    if (!name) {
      throw new Error("El campo name es obligatorio en --> userDbCreate");
    }
    if (!email) {
      throw new Error("El campo email es obligatorio en --> userDbCreate");
    }
    if (!password) {
      throw new Error(
        "El campo hashPassword es obligatorio en --> userDbCreate"
      );
    }

    const createUser = await userDb.create(userDataObject);

    return createUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const SignUp = async (userDb, userDataObject) => {
  const { name, email, password, image, isAdmin } = userDataObject;

  try {
    if (!userDb) {
      throw new Error("El campo userDb es obligatorio en --> SignUp");
    }
    if (!name) {
      throw new Error("El campo name es obligatorio en --> SignUp");
    }
    if (!email) {
      throw new Error("El campo email es obligatorio en --> SignUp");
    }
    if (!password) {
      throw new Error("El campo password es obligatorio en --> SignUp");
    }

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

    const userDataObjectModifiedByHash = {
      name,
      email,
      password: hashPassword,
      image,
      isAdmin,
    };

    const createUser = await userDbCreate(userDb, userDataObjectModifiedByHash);

    return createUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const SignIn = async (userDb, email, password) => {
  try {
    if (!userDb) {
      throw new Error("El campo userDb es obligatorio en --> SignIn");
    }
    if (!email) {
      throw new Error("El campo email es obligatorio en --> SignIn");
    }
    if (!password) {
      throw new Error("El campo password es obligatorio en --> SignIn");
    }

    const emailSearch = await emailExists(userDb, email);

    if (!emailSearch) {
      throw new Error("Correo no existe en la db");
    }

    const validHashPassword = await validHash(
      password,
      emailSearch.dataValues.password
    );

    if (validHashPassword) {
      const token = await generateToken(userDb, email);

      return token;
    }

    throw new Error(
      "Error en la generacion del token, verifica si tiene correctamente instalado JWT o alguno de los parametros no es correcto"
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const verifyClientIdCredential = async (authorizationUrl) => {
  try {
    if (!authorizationUrl) {
      throw new Error(
        "El campo authorizationUrl es obligatorio en --> verifyClientIdCredential"
      );
    }
    //Se guarda el objeto que devuelve la ejecucion de la funcion signInGoogle
    const getAuthorizationUrl = await axios.get(authorizationUrl);

    //Se guarda lo que contiene responseUrl que esta dentro de getAuthorizationUrl
    const getUrlError = getAuthorizationUrl.request.res.responseUrl;

    //Con el metodo URLSearchParams elimino todo lo que esta antes del query urlError
    const urlParameters = new URLSearchParams(
      getUrlError.substring(getUrlError.indexOf("?") + 1)
    );

    //Me guardo con el metodo get el valor del query authError
    const authError = urlParameters.get("authError");

    let decodedError, cleanDecodedError;

    if (authError) {
      //Decodifico el valor de authError a utf-8
      decodedError = Buffer.from(authError, "base64").toString("utf-8");

      //Elimino los caracteres especiales, dejo solo el texto
      cleanDecodedError = decodedError.replace(/[^\x20-\x7E]/g, "");

      //Si la credenciales de CLIENT_ID no son validas, devuelve un false como confirmacion
      console.log("Credencial CLIENT_ID validada, es incorrecta");
      throw new Error(cleanDecodedError);
    }
  } catch (error) {
    //Si las credenciales de CLIENT_ID son correctas devuelve un true como confirmacion y el codigo de error
    console.log(error);
    throw error;
  }
  console.log("Credencial CLIENT_ID validada, es correcta");
  return true;
};

const signInGoogle = async (clientId, redirectUrl, scope) => {
  try {
    if (!clientId) {
      throw new Error("El campo clientId es obligatorio en --> signInGoogle");
    }
    if (!redirectUrl) {
      throw new Error(
        "El campo redirectUrl es obligatorio en --> signInGoogle"
      );
    }
    if (!scope) {
      throw new Error("El campo scope es obligatorio en --> signInGoogle");
    }

    const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&scope=${encodeURIComponent(
      scope
    )}`;

    await verifyClientIdCredential(authorizationUrl);

    return authorizationUrl;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const googleAuthorizationCode = (req) => {
  try {
    if (!req) {
      throw new Error(
        "El campo req es obligatorio en --> googleAuthorizationCode"
      );
    }
    const { code } = req.query;

    if (!code) {
      throw new Error("Codigo no encontrado");
    }

    return code;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAccessToken = async (code, clientId, clientSecret, redirectUrl) => {
  try {
    if (!code) {
      throw new Error("El campo code es obligatorio en --> getAccessToken");
    }
    if (!clientId) {
      throw new Error("El campo clientId es obligatorio en --> getAccessToken");
    }
    if (!clientSecret) {
      throw new Error(
        "El campo clientSecret es obligatorio en --> getAccessToken"
      );
    }
    if (!redirectUrl) {
      throw new Error(
        "El campo redirectUrl es obligatorio en --> getAccessToken"
      );
    }

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
    if (error.response && error.response.status === 401) {
      console.log(
        "Error de autenticación: Credencial clientSecret inválida o insuficiente"
      );
      throw new Error(
        "Error de autenticación: Credencial clientSecret inválida o insuficiente"
      );
    } else {
      console.log(error);
      throw error;
    }
  }
};

const getUserInformation = async (accessToken) => {
  try {
    if (!accessToken) {
      throw new Error(
        "El campo accessToken es obligatorio en --> getUserInformation"
      );
    }

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
    if (error.response && error.response.status === 401) {
      console.log(
        "Error de autenticación: Credenciales de accessToken inválidos o insuficientes"
      );
      throw new Error(
        "Error de autenticación: Credenciales de accessToken inválidos o insuficientes"
      );
    } else {
      console.log(error);
      throw error;
    }
  }
};

const authGoogle = async (req, clientId, clientSecret, redirectUrl) => {
  try {
    if (!req) {
      throw new Error("El campo req es obligatorio en --> authGoogle");
    }
    if (!clientId) {
      throw new Error("El campo clientId es obligatorio en --> authGoogle");
    }
    if (!clientSecret) {
      throw new Error("El campo clientSecret es obligatorio en --> authGoogle");
    }
    if (!redirectUrl) {
      throw new Error("El campo redirectUrl es obligatorio en --> authGoogle");
    }

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
    const decodedToken = await jwt.decode(accessToken.id_token);

    return {
      code,
      accessToken,
      getInfo,
      decodedToken,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const generatePassword = (passwordLength) => {
  try {
    const characters = process.env.GENERATE_PASSWORD;
    let password = "";

    for (let i = 0; i < passwordLength; i++) {
      let index = Math.floor(Math.random() * characters.length);
      password += characters.charAt(index);
    }
    console.log("este es passwor aleatorio", password);

    return password;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  SignUp,
  SignIn,
  signInGoogle,
  authGoogle,
  generatePassword,
};
