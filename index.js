const server = require("./src/app.js");
const { conn } = require("./src/db.js");
const port = process.env.PORT || 3001;

conn.sync({ force: false, alter: false }).then(async () => {
  server.listen(port, () => {
    console.log(`Server up in port ${port}`);
  });
});
