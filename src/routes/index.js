const Router = require("express");
const notesR = require("./notesR.js");
const userR = require("./userR.js");

const router = Router();

router.use("/notes", notesR);
router.use("/user", userR);

module.exports = router;
