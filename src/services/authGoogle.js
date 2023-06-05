const axios = require("axios");

const CLIENT_ID =
  "851275819483-94ma132th8ejk8fdstkhtur9e0ap3stg.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:3001/auth/google/callback";

// Ruta inicial para iniciar el proceso de autenticación
app.get("/auth/google", (req, res) => {
  const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=profile email`;
  res.redirect(authorizationUrl);
});

// Ruta de devolución de llamada para recibir el código de autorización y obtener el token de acceso
app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    // Obtener el token de acceso utilizando el código de autorización
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

    const accessToken = tokenResponse.data.access_token;
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

    // Realiza acciones adicionales con los datos del usuario, como crear una sesión, guardar en la base de datos, etc.

    // Redirige al usuario a la página de inicio o a donde desees
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error en la autenticación de Google");
  }
});

// Ruta de prueba protegida para mostrar los datos del usuario autenticado
app.get("/dashboard", (req, res) => {
  // Verifica la autenticación antes de mostrar los datos protegidos
  if (req.user) {
    res.send(`Bienvenido, ${req.user.name}!`);
  } else {
    res.redirect("/auth/google");
  }
});

/* ID DEL CLIENTE = 
851275819483-94ma132th8ejk8fdstkhtur9e0ap3stg.apps.googleusercontent.com */

/* SECRETO DEL CLIENTE =
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 */
