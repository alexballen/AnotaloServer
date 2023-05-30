const { Router } = require("express");
const { getAllUser, postUser } = require("../controler/userC.js");

const router = Router();

router.get("/", getAllUser);
router.post("/", postUser);

module.exports = router;
