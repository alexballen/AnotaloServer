const authConstans = {
  email_exists: "Correo ya existe en la db",
  email_does_not_exist: "Correo no existe",
  valid_hash: "Validacion de hash incorrecta",
  error_in_function: "Error en funcion -->",
  obligatory_field: "Campo obligatorio",
};

const userConstans = {
  error_in_function: "Error en funcion -->",
  incomplete_data: "Datos incompletos",
};

const templateConstans = {
  singUp: "sing_up.ejs",
  singIn: "sing_in.ejs",
};

module.exports = {
  authConstans,
  userConstans,
  templateConstans,
};

/* {
  "greeting":"Hola querido usuario",
  "subject": "Su pago esta pendiente",
  "email":"arcario55@hotmail.com",
  "message": "Hola esto es un mesaje de prueba para verificar el funcionamiento de nodemailer, pero pague..."
} */

/* {
  "greeting":"Bienvenido",
  "subject": "Registro exitoso",
  "email":"arcario55@hotmail.com",
  "message": "Su registro fue completado satisfactoriamente..."
} */
