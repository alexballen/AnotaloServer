const { Router } = require("express");
const { getAllUser, postUser, postSendMail } = require("../controler/userC.js");

const router = Router();

router.get("/", getAllUser);
router.post("/email", postSendMail);
router.post("/", postUser);

module.exports = router;
